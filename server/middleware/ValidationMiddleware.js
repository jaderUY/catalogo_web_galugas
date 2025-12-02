/**
 * Middleware de validación centralizado
 */

import { VALIDATION_RULES } from '../constants/app.js';
import { AppError } from '../utils/ErrorHandler.js';

/**
 * Valida un email
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return VALIDATION_RULES.EMAIL.REGEX.test(email.trim());
};

/**
 * Valida una contraseña
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return false;
  }
  return password.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH &&
         password.length <= VALIDATION_RULES.PASSWORD.MAX_LENGTH;
};

/**
 * Valida un nombre
 */
export const validateNombre = (nombre) => {
  if (!nombre || typeof nombre !== 'string') {
    return false;
  }
  return nombre.length >= VALIDATION_RULES.NOMBRE.MIN_LENGTH &&
         nombre.length <= VALIDATION_RULES.NOMBRE.MAX_LENGTH;
};

/**
 * Valida un precio
 */
export const validatePrecio = (precio) => {
  const num = parseFloat(precio);
  return !isNaN(num) && 
         num >= VALIDATION_RULES.PRECIO.MIN && 
         num <= VALIDATION_RULES.PRECIO.MAX;
};

/**
 * Valida stock
 */
export const validateStock = (stock) => {
  const num = parseInt(stock);
  return !isNaN(num) && 
         num >= VALIDATION_RULES.STOCK.MIN && 
         num <= VALIDATION_RULES.STOCK.MAX;
};

/**
 * Middleware para validar request body
 */
export const validateRequestBody = (schema) => {
  return (req, res, next) => {
    const { body } = req;
    const errors = [];

    // Validar campos requeridos
    for (const [field, rules] of Object.entries(schema)) {
      if (rules.required && (!body[field] || body[field].toString().trim() === '')) {
        errors.push(`${field} es requerido`);
      }

      if (body[field]) {
        // Validar tipo
        if (rules.type === 'email' && !validateEmail(body[field])) {
          errors.push(`${field} debe ser un email válido`);
        }

        if (rules.type === 'password' && !validatePassword(body[field])) {
          errors.push(`${field} debe tener al menos ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} caracteres`);
        }

        if (rules.type === 'number' && isNaN(parseFloat(body[field]))) {
          errors.push(`${field} debe ser un número`);
        }

        // Validar longitud
        if (rules.minLength && body[field].toString().length < rules.minLength) {
          errors.push(`${field} debe tener al menos ${rules.minLength} caracteres`);
        }

        if (rules.maxLength && body[field].toString().length > rules.maxLength) {
          errors.push(`${field} debe tener máximo ${rules.maxLength} caracteres`);
        }

        // Validar expresión regular
        if (rules.pattern && !rules.pattern.test(body[field])) {
          errors.push(`${field} tiene un formato inválido`);
        }
      }
    }

    if (errors.length > 0) {
      return next(new AppError(errors.join(', '), 400));
    }

    next();
  };
};

/**
 * Middleware para sanitizar entrada
 */
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'string') {
        // Eliminar espacios en blanco al inicio y final
        obj[key] = obj[key].trim();
        
        // Escapar caracteres especiales para prevenir XSS
        obj[key] = obj[key]
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);

  next();
};

/**
 * Middleware para validar ID
 */
export const validateIdParam = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return next(new AppError('ID inválido', 400));
  }

  req.params.id = parseInt(id);
  next();
};

/**
 * Middleware para validar paginación
 */
export const validatePagination = (req, res, next) => {
  const { limit = 20, offset = 0, page = 1 } = req.query;

  const parsedLimit = Math.min(parseInt(limit) || 20, 100);
  const parsedOffset = Math.max(parseInt(offset) || 0, 0);
  const parsedPage = Math.max(parseInt(page) || 1, 1);

  req.pagination = {
    limit: parsedLimit,
    offset: parsedOffset,
    page: parsedPage
  };

  next();
};

export default {
  validateEmail,
  validatePassword,
  validateNombre,
  validatePrecio,
  validateStock,
  validateRequestBody,
  sanitizeInput,
  validateIdParam,
  validatePagination
};
