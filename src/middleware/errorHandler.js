export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.expose ? err.message : "Internal server error";

  console.error(`[error] ${err.message}`, err.stack);

  res.status(status).json({
    success: false,
    error: message,
  });
}

export function notFoundHandler(_req, res) {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
}
