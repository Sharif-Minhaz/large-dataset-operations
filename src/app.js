import express from "express";
import cors from "cors";
import productRoutes from "./routes/products.js";
import { limiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

// ─── Global middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// ─── Request logging ────────────────────────────────────────────
app.use((req, _res, next) => {
  const start = Date.now();
  const originalEnd = _res.end;
  _res.end = function (...args) {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} → ${_res.statusCode} (${duration}ms)`);
    originalEnd.apply(this, args);
  };
  next();
});

// ─── Health check ───────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ─── Routes ─────────────────────────────────────────────────────
app.use(productRoutes);

// ─── Error handling ─────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
