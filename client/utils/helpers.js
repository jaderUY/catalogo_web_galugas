/**
 * Utilidades para validación y formateo en el cliente
 */

/**
 * Valida un email
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida una contraseña
 */
export const isValidPassword = (password) => {
  // Mínimo 6 caracteres, al menos una letra y un número
  return password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password);
};

/**
 * Valida un teléfono
 */
export const isValidPhone = (phone) => {
  const regex = /^[0-9\s\-\+\(\)]+$/;
  return regex.test(phone);
};

/**
 * Formatea un número como moneda
 */
export const formatCurrency = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    return `$${parseFloat(amount).toFixed(2)}`;
  }
};

/**
 * Formatea una fecha
 */
export const formatDate = (date, locale = 'es-UY') => {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  } catch (error) {
    return new Date(date).toLocaleDateString();
  }
};

/**
 * Formatea una fecha y hora
 */
export const formatDateTime = (date, locale = 'es-UY') => {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(date));
  } catch (error) {
    return new Date(date).toLocaleString();
  }
};

/**
 * Trunca un texto a una longitud máxima
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Genera un slug a partir de un texto
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
 */
export const sanitizeText = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

/**
 * Valida si un objeto está vacío
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Debounce para funciones
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle para funciones
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Obtiene el parámetro de URL
 */
export const getQueryParam = (param) => {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(param);
};

/**
 * Establece parámetros de URL
 */
export const setQueryParams = (params) => {
  const searchParams = new URLSearchParams(window.location.search);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
  });
  window.history.pushState(null, '', `?${searchParams.toString()}`);
};

/**
 * Retardo en milisegundos (promesa)
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  formatCurrency,
  formatDate,
  formatDateTime,
  truncateText,
  generateSlug,
  sanitizeText,
  isEmpty,
  debounce,
  throttle,
  getQueryParam,
  setQueryParams,
  delay
};
