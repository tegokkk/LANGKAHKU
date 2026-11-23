import pino from "pino";

export const logger = pino({
  level: process.env.NODE_ENV === "test" ? "silent" : "info",
  // Only log explicit event metadata. Never pass request bodies or raw errors.
  redact: ["password", "cookie", "authorization", "body", "headers"],
});
