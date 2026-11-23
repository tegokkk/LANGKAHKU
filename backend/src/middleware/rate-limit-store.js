import { createHash } from "node:crypto";

// Atomic shared fixed windows: restarts and multiple API instances cannot reset quotas.
// IP addresses are hashed so the table contains no raw network identifiers.
export class PostgresRateLimitStore {
  localKeys = false;
  constructor(pool, bucket) {
    this.pool = pool;
    this.prefix = bucket;
  }
  init({ windowMs }) {
    this.windowMs = windowMs;
  }
  hash(key) {
    return createHash("sha256").update(`${this.prefix}:${key}`).digest("hex");
  }
  async increment(key) {
    const {
      rows: [row],
    } = await this.pool.query(
      `INSERT INTO rate_limit_buckets(bucket,key_hash,hits,reset_at)
       VALUES($1,$2,1,clock_timestamp()+$3*interval '1 millisecond')
       ON CONFLICT(bucket,key_hash) DO UPDATE SET
       hits=CASE WHEN rate_limit_buckets.reset_at<=clock_timestamp() THEN 1 ELSE rate_limit_buckets.hits+1 END,
       reset_at=CASE WHEN rate_limit_buckets.reset_at<=clock_timestamp() THEN EXCLUDED.reset_at ELSE rate_limit_buckets.reset_at END
       RETURNING hits,reset_at`,
      [this.prefix, this.hash(key), this.windowMs],
    );
    return { totalHits: row.hits, resetTime: row.reset_at };
  }
  async decrement(key) {
    await this.pool.query(
      "UPDATE rate_limit_buckets SET hits=GREATEST(0,hits-1) WHERE bucket=$1 AND key_hash=$2",
      [this.prefix, this.hash(key)],
    );
  }
  async resetKey(key) {
    await this.pool.query(
      "DELETE FROM rate_limit_buckets WHERE bucket=$1 AND key_hash=$2",
      [this.prefix, this.hash(key)],
    );
  }
}
