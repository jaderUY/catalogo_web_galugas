// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err);
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const payload = {
    message: err.message || 'Error interno del servidor'
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};

module.exports = errorHandler;