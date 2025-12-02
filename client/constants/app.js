/**
 * Constantes de la aplicación cliente
 */

export const ROLES = {
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
  USUARIO: 'Usuario'
};

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
};

export const PAGINATION = {
  ITEMS_PER_PAGE: 12,
  ITEMS_PER_ADMIN_PAGE: 20,
  MAX_ITEMS: 100
};

export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Sesión iniciada correctamente',
    LOGOUT: 'Sesión cerrada correctamente',
    REGISTER: 'Registro completado correctamente',
    DELETE: 'Elemento eliminado correctamente',
    UPDATE: 'Cambios guardados correctamente',
    CREATE: 'Elemento creado correctamente'
  },
  ERROR: {
    UNAUTHORIZED: 'No autorizado para realizar esta acción',
    FORBIDDEN: 'Acceso denegado',
    NOT_FOUND: 'Recurso no encontrado',
    SERVER_ERROR: 'Error del servidor. Por favor intenta nuevamente',
    NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet',
    INVALID_INPUT: 'Los datos ingresados no son válidos',
    PERMISSION_DENIED: 'No tienes permisos para realizar esta acción'
  }
};

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_REGEX: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
  PHONE_REGEX: /^[0-9\s\-\+\(\)]+$/,
  SLUG_REGEX: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
};

export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: ['application/pdf', 'application/msword'],
  ALL: ['image/*', 'application/pdf']
};

export const ROUTES = {
  HOME: '/',
  CATALOGO: '/catalogo',
  PRODUCTO: (id) => `/producto/${id}`,
  ABOUT: '/about',
  CONTACT: '/contact',
  BUSCAR: '/buscar',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile'
  },
  ADMIN: {
    DASHBOARD: '/admin',
    DISPOSITIVOS: '/admin/dispositivos',
    CATEGORIAS: '/admin/categorias',
    MARCAS: '/admin/marcas',
    USUARIOS: '/admin/usuarios',
    LOGS: '/admin/logs'
  }
};

export const API_ENDPOINTS = {
  DISPOSITIVOS: '/dispositivos',
  CATEGORIAS: '/categorias',
  MARCAS: '/marcas',
  AUTH: '/auth',
  USUARIOS: '/usuarios',
  LOGS: '/logs'
};

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export default {
  ROLES,
  HTTP_METHODS,
  PAGINATION,
  MESSAGES,
  VALIDATION,
  FILE_TYPES,
  ROUTES,
  API_ENDPOINTS,
  STATUS_CODES
};
