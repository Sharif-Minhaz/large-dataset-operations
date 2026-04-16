const config = {
  db: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "products_db",
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 20,
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
  port: parseInt(process.env.PORT, 10) || 8080,
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60_000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
};

export default config;
