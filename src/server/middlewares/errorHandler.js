// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Log del error
  console.error({
    timestamp: new Date().toISOString(),
    status,
    message: err.message,
    path: req.path,
    method: req.method,
    stack: isDevelopment ? err.stack : undefined
  });

  // Si los headers ya fueron enviados, pasar al siguiente middleware
  if (res.headersSent) {
    return next(err);
  }

  // Respuesta de error segura
  const response = {
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(isDevelopment && { stack: err.stack })
  };

  res.status(status).json(response);
};

module.exports = errorHandler;