import { config } from '../config/environment.js';

/**
 * Clase personalizada para errores de la aplicación
 */
export class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      ...(config.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}

/**
 * Middleware global de manejo de errores
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.session?.user?.usuario_id || 'No autenticado'
  });

  // Error de MySQL
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        error = new AppError('El registro ya existe en la base de datos', 400);
        break;
      case 'ER_NO_REFERENCED_ROW':
      case 'ER_NO_REFERENCED_ROW_2':
        error = new AppError('Referencia a registro inexistente', 400);
        break;
      case 'ER_ACCESS_DENIED_ERROR':
        error = new AppError('Error de acceso a la base de datos', 500);
        break;
      case 'ECONNREFUSED':
        error = new AppError('No se puede conectar a la base de datos', 503);
        break;
    }
  }

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(error => error.message);
    error = new AppError('Error de validación', 400, messages);
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Token inválido', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expirado', 401);
  }

  // Error de Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new AppError('El archivo es demasiado grande', 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = new AppError('Campo de archivo inesperado', 400);
  }

  // Si no es un error operacional, enviar error genérico
  if (!error.isOperational) {
    console.error('ERROR NO OPERACIONAL:', err);
    error = new AppError(
      'Error interno del servidor', 
      500,
      config.NODE_ENV === 'development' ? err.stack : undefined
    );
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(config.NODE_ENV === 'development' && { 
      stack: error.stack,
      originalError: err.message 
    }),
    timestamp: error.timestamp
  });
};

/**
 * Middleware para rutas no encontradas
 */
export const notFound = (req, res, next) => {
  const error = new AppError(
    `Ruta no encontrada - ${req.method} ${req.originalUrl}`, 
    404
  );
  next(error);
};

/**
 * Wrapper para manejar errores en funciones async
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
  AppError,
  errorHandler,
  notFound,
  asyncHandler
};