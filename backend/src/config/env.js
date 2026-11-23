import { z } from "zod";
const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  HOST: z.enum(["127.0.0.1", "0.0.0.0", "::"]).default("127.0.0.1"),
  STATIC_DIR: z.string().min(1).optional(),
  DATABASE_URL: z.string().startsWith("postgresql://"),
  SESSION_SECRET: z.string().min(32),
  APP_ORIGIN: z
    .url()
    .refine((value) => {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) && url.origin === value;
    }, "APP_ORIGIN harus origin HTTP(S), tanpa path atau garis miring akhir.")
    .default("http://127.0.0.1:5173"),
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
  DEMO_MODE: z.enum(["true", "false"]).default("false"),
  RETENTION_ENABLED: z.enum(["true", "false"]).default("false"),
  PENDING_RETENTION_DAYS: z.coerce.number().int().min(1).default(30),
  DELETION_LEDGER_PATH: z.string().min(1).optional(),
});
export function readConfig(overrides = {}) {
  const config = schema.parse({ ...process.env, ...overrides });
  if (
    config.NODE_ENV === "production" &&
    (config.DEMO_MODE === "true" ||
      !config.APP_ORIGIN.startsWith("https://") ||
      config.SESSION_SECRET.startsWith("replace-") ||
      !config.DELETION_LEDGER_PATH)
  )
    throw new Error(
      "Konfigurasi produksi tidak aman. HTTPS, secret acak, DEMO_MODE=false dan DELETION_LEDGER_PATH persisten wajib.",
    );
  return config;
}
