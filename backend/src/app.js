import express from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import helmet from "helmet";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { resolve, extname, sep } from "node:path";
import { logger } from "./config/logger.js";
import { ZodError } from "zod";
import { loadUser } from "./middleware/access.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { approvalRoutes } from "./modules/approvals/approvals.routes.js";
import { studentRoutes } from "./modules/student/student.routes.js";
import { consultationRoutes } from "./modules/consultations/consultations.routes.js";
import { contentRoutes } from "./modules/content/content.routes.js";
import { rightsRoutes } from "./modules/data-rights/rights.routes.js";
import { AppError } from "./utils/errors.js";
export function createApp({ pool, config }) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", config.TRUST_PROXY);
  app.use(helmet());
  app.use((req, res, next) => {
    req.requestId = randomUUID();
    res.set("X-Request-ID", req.requestId);
    const start = performance.now();
    res.on("finish", () => {
      if (config.NODE_ENV !== "test" && req.path.startsWith("/api/"))
        logger.info({
          event: "request_completed",
          requestId: req.requestId,
          method: req.method,
          route: req.route?.path || "unmatched",
          status: res.statusCode,
          durationMs: Math.round(performance.now() - start),
        });
    });
    next();
  });
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store, private");
    res.vary("Cookie");
    next();
  });
  app.get("/api/v1/health/live", (_req, res) => res.json({ ok: true }));
  app.get(["/api/v1/health", "/api/v1/health/ready"], async (req, res) => {
    try {
      if (app.locals.draining) return res.status(503).json({ ok: false });
      await pool.query("SELECT 1");
      if (req.path.endsWith("/ready") && config.NODE_ENV === "production") {
        const {
          rows: [worker],
        } = await pool.query(
          "SELECT 1 FROM worker_health WHERE name='retention' AND failed=false AND last_success_at>now()-interval '3 minutes'",
        );
        if (!worker) return res.status(503).json({ ok: false });
      }
      res.json({ ok: true });
    } catch {
      res.status(503).json({ ok: false });
    }
  });
  app.use("/api", (_req, res, next) => {
    if (app.locals.draining)
      return res.status(503).json({
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Layanan sedang diperbarui. Coba lagi sebentar.",
        },
      });
    next();
  });
  app.use(express.json({ limit: "128kb" }));
  if (config.STATIC_DIR) {
    app.use(
      express.static(resolve(config.STATIC_DIR), {
        index: false,
        setHeaders(res, file) {
          res.set(
            "Cache-Control",
            file.includes(`${sep}assets${sep}`)
              ? "public, max-age=31536000, immutable"
              : "no-cache",
          );
          if (file.endsWith("sw.js")) res.set("Service-Worker-Allowed", "/");
        },
      }),
    );
  }
  app.use(
    session({
      name: "langkahku.sid",
      store: new (pgSession(session))({
        pool,
        tableName: "sessions",
        createTableIfMissing: false,
      }),
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: config.NODE_ENV === "production",
        maxAge: 8 * 60 * 60 * 1000,
      },
    }),
  );
  app.use("/api/v1", (req, res, next) => {
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const a = Buffer.from(req.get("x-csrf-token") || ""),
        b = Buffer.from(req.session.csrf || "");
      if (!b.length || a.length !== b.length || !timingSafeEqual(a, b))
        return next(
          new AppError(
            403,
            "Sesi formulir berakhir. Muat ulang halaman.",
            "CSRF_INVALID",
          ),
        );
      const origin = req.get("origin");
      if (origin && origin !== config.APP_ORIGIN)
        return next(
          new AppError(403, "Origin tidak diizinkan.", "ORIGIN_INVALID"),
        );
    }
    next();
  });
  app.use("/api/v1", loadUser(pool));
  app.use("/api/v1/auth", authRoutes(pool, config));
  app.use("/api/v1/admin", approvalRoutes(pool));
  app.use("/api/v1/student", studentRoutes(pool, config));
  app.use("/api/v1", consultationRoutes(pool));
  app.use("/api/v1", contentRoutes(pool, config));
  app.use("/api/v1", rightsRoutes(pool, config));
  if (config.STATIC_DIR)
    app.get("/{*path}", (req, res, next) => {
      if (
        req.path === "/api" ||
        req.path.startsWith("/api/") ||
        extname(req.path) ||
        req.path.split("/").some((part) => part.startsWith("."))
      )
        return next();
      res.set("Cache-Control", "no-cache");
      res.sendFile(resolve(config.STATIC_DIR, "index.html"));
    });
  app.use((_req, _res, next) =>
    next(new AppError(404, "Alamat API tidak ditemukan.")),
  );
  app.use((error, req, res, _next) => {
    if (res.headersSent) return _next(error);
    let status = error.status || 500,
      code = error.code || "INTERNAL_ERROR",
      message = error.message;
    if (error instanceof ZodError) {
      status = 422;
      code = "VALIDATION_ERROR";
      message = error.issues
        .map((i) => `${i.path.join(".") || "Form"}: ${i.message}`)
        .join(" · ");
    }
    if (error.code === "23505") {
      status = 409;
      code = "CONFLICT";
      message =
        "Username atau data unik sudah digunakan. Muat ulang sebelum mencoba lagi.";
    }
    if (error.code === "22P02") {
      status = 422;
      code = "INVALID_ID";
      message = "Format ID tidak valid.";
    }
    if (error.type === "entity.parse.failed") {
      status = 400;
      code = "INVALID_JSON";
      message = "Format permintaan tidak valid.";
    }
    if (error.type === "entity.too.large") {
      status = 413;
      code = "PAYLOAD_TOO_LARGE";
      message = "Isi permintaan terlalu besar. Kurangi isi formulir.";
    }
    if (
      [
        "53300",
        "57P01",
        "57P02",
        "57P03",
        "08006",
        "ECONNREFUSED",
        "ECONNRESET",
        "57014",
      ].includes(error.code)
    ) {
      status = 503;
      code = "SERVICE_UNAVAILABLE";
    }
    if (status >= 500) {
      logger.error(
        {
          event: "request_failed",
          requestId: req.requestId,
          code: typeof error.code === "string" ? error.code : "INTERNAL_ERROR",
        },
        "Permintaan gagal",
      );
      message = "Layanan belum dapat memproses permintaan. Silakan coba lagi.";
    }
    res
      .status(status)
      .json({
        error: {
          code: status >= 500 ? "SERVICE_UNAVAILABLE" : code,
          message,
          requestId: req.requestId,
        },
      });
  });
  return app;
}
