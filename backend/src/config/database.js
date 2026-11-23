import pg from "pg";
import { logger } from "./logger.js";
export function createPool(connectionString) {
  const pool = new pg.Pool({
    connectionString,
    max: 15,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    statement_timeout: 15000,
    query_timeout: 20000,
    idle_in_transaction_session_timeout: 30000,
    application_name: "langkahku",
  });
  // An idle connection failure emits outside request handlers. Never log credentials.
  pool.on("error", (error) => {
    logger.error({
      event: "database_idle_error",
      code: error.code || "DB_ERROR",
    });
  });
  return pool;
}
export async function transaction(pool, action) {
  const client = await pool.connect();
  let discard = false;
  try {
    await client.query("BEGIN");
    const result = await action(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      discard = true;
    }
    throw error;
  } finally {
    client.release(discard);
  }
}
export const one = async (db, sql, values = []) =>
  (await db.query(sql, values)).rows[0];
export const audit = (db, actor, event, target) =>
  db.query(
    "INSERT INTO audit_logs(actor_id,event,target_id) VALUES($1,$2,$3)",
    [actor, event, target],
  );
export const revokeSessions = (db, id) =>
  db.query("DELETE FROM sessions WHERE sess->>'userId'=$1", [id]);
