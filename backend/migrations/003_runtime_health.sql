CREATE TABLE rate_limit_buckets (
  bucket text NOT NULL,
  key_hash text NOT NULL,
  hits integer NOT NULL CHECK (hits >= 0),
  reset_at timestamptz NOT NULL,
  PRIMARY KEY (bucket, key_hash)
);
CREATE INDEX rate_limit_expiry ON rate_limit_buckets(reset_at);

CREATE TABLE worker_health (
  name text PRIMARY KEY,
  last_success_at timestamptz,
  last_attempt_at timestamptz NOT NULL DEFAULT now(),
  failed boolean NOT NULL DEFAULT false
);
