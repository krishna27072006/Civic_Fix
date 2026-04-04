export function notFoundHandler(_req, _res, next) {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;

  return res.status(status).json({
    success: false,
    message: error.message || 'Internal server error',
    details: error.details || null
  });
}
