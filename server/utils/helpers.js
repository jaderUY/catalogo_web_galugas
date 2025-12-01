/**
 * Utilidades generales para el sistema
 */

/**
 * Formatea un precio a formato monetario
 * @param {number} price - Precio a formatear
 * @param {string} currency - Moneda (por defecto USD)
 * @returns {string} Precio formateado
 */
export const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  }).format(price);
};

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Genera un slug a partir de un texto
 * @param {string} text - Texto a convertir
 * @returns {string} Slug generado
 */
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Sanitiza un texto para prevenir XSS
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export const sanitizeText = (text) => {
  if (typeof text !== 'string') return text;
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @param {string} suffix - Sufijo a agregar
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Calcula el offset para paginación
 * @param {number} page - Página actual
 * @param {number} limit - Límite por página
 * @returns {number} Offset calculado
 */
export const calculateOffset = (page, limit) => {
  return (page - 1) * limit;
};

/**
 * Genera una respuesta estándar para APIs
 * @param {boolean} success - Si fue exitoso
 * @param {any} data - Datos de la respuesta
 * @param {string} message - Mensaje opcional
 * @param {Object} meta - Metadatos adicionales
 * @returns {Object} Respuesta estándar
 */
export const buildResponse = (success, data = null, message = '', meta = {}) => {
  return {
    success,
    data,
    message,
    ...meta,
    timestamp: new Date().toISOString()
  };
};

/**
 * Valida y parsea parámetros de consulta
 * @param {Object} query - Objeto query de Express
 * @returns {Object} Parámetros parseados
 */
export const parseQueryParams = (query) => {
  const params = { ...query };
  
  // Convertir strings a números donde sea apropiado
  if (params.page) params.page = parseInt(params.page) || 1;
  if (params.limit) params.limit = parseInt(params.limit) || 10;
  if (params.offset) params.offset = parseInt(params.offset) || 0;
  
  // Convertir strings a booleanos
  if (params.active) params.active = params.active === 'true';
  
  return params;
};

/**
 * Maneja errores de validación
 * @param {Array} errors - Array de errores de validación
 * @returns {Object} Error formateado
 */
export const formatValidationErrors = (errors) => {
  return {
    message: 'Error de validación',
    errors: errors.map(error => ({
      field: error.field,
      message: error.message
    }))
  };
};

export default {
  formatPrice,
  isValidEmail,
  generateSlug,
  sanitizeText,
  truncateText,
  calculateOffset,
  buildResponse,
  parseQueryParams,
  formatValidationErrors
};