// middlewares/errorHandler.js

/**
 * Middleware global para manejo de errores
 * Captura errores de express-async-errors y los formatea consistentemente
 */
const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Determinar el código de estado
  let status = err.status || err.statusCode || 500;
  
  // Algunos errores tienen statusCode específicos
  if (err.message && err.message.includes('no encontrado')) {
    status = 404;
  } else if (err.message && err.message.includes('debe iniciar sesión')) {
    status = 401;
  } else if (err.message && (err.message.includes('permisos') || err.message.includes('denegado'))) {
    status = 403;
  } else if (err.message && (err.message.includes('requerido') || err.message.includes('inválido'))) {
    status = 400;
  }

  // Log detallado en desarrollo
  const logObject = {
    timestamp: new Date().toISOString(),
    status,
    message: err.message,
    path: req.path,
    method: req.method,
    userAgent: req.headers['user-agent']
  };

  if (isDevelopment) {
    logObject.stack = err.stack;
    console.error('❌ ERROR:', JSON.stringify(logObject, null, 2));
  } else {
    console.error(`[${logObject.timestamp}] ${logObject.status} ${logObject.method} ${logObject.path} - ${err.message}`);
  }

  // Si los headers ya fueron enviados, pasar al siguiente middleware
  if (res.headersSent) {
    return next(err);
  }

  // Respuesta JSON consistente
  const response = {
    success: false,
    status,
    message: err.message || 'Error interno del servidor',
    ...(isDevelopment && { stack: err.stack.split('\n') })
  };

  // Establecer status HTTP
  res.status(status);

  // Si es una solicitud API o pide JSON
  if (req.path.startsWith('/api/') || req.headers['accept']?.includes('application/json')) {
    return res.json(response);
  }

  // Si es una vista (HTML)
  return res.render('error', {
    status,
    message: response.message,
    stack: isDevelopment ? response.stack : undefined
  });
};

module.exports = errorHandler;