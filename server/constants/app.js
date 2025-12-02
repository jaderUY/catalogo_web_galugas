/**
 * Constantes globales del servidor
 */

export const ROLES = {
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
  USUARIO: 'Usuario'
};

export const ESTADOS = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  SUSPENDIDO: 'Suspendido'
};

export const DISPOSITIVO_ESTADOS = {
  DISPONIBLE: 'Disponible',
  AGOTADO: 'Agotado',
  DESCONTINUADO: 'Descontinuado'
};

export const ACCIONES_LOG = {
  CREAR: 'Crear',
  LEER: 'Leer',
  ACTUALIZAR: 'Actualizar',
  ELIMINAR: 'Eliminar',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  DESCARGAR: 'Descargar',
  EXPORTAR: 'Exportar'
};

export const MODULOS = {
  DISPOSITIVOS: 'Dispositivos',
  CATEGORIAS: 'Categorías',
  MARCAS: 'Marcas',
  USUARIOS: 'Usuarios',
  AUTH: 'Autenticación',
  CONFIGURACION: 'Configuración',
  REPORTES: 'Reportes'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  DEFAULT_OFFSET: 0,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1
};

export const VALIDATION_RULES = {
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 255,
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 255,
    REGEX: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/
  },
  NOMBRE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    REGEX: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
  },
  PRECIO: {
    MIN: 0,
    MAX: 999999.99
  },
  STOCK: {
    MIN: 0,
    MAX: 9999
  }
};

export const CACHE_KEYS = {
  DISPOSITIVOS_ALL: 'dispositivos:all',
  DISPOSITIVOS_BY_ID: (id) => `dispositivos:${id}`,
  CATEGORIAS_ALL: 'categorias:all',
  MARCAS_ALL: 'marcas:all',
  USUARIO_BY_ID: (id) => `usuario:${id}`,
  LOGS_USER: (userId) => `logs:user:${userId}`
};

export const CACHE_DURATION = {
  SHORT: 5 * 60,        // 5 minutos
  MEDIUM: 30 * 60,      // 30 minutos
  LONG: 60 * 60,        // 1 hora
  VERY_LONG: 24 * 60 * 60 // 24 horas
};

export const ERROR_MESSAGES = {
  NOT_FOUND: 'Recurso no encontrado',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
  INVALID_INPUT: 'Entrada inválida',
  SERVER_ERROR: 'Error interno del servidor',
  DUPLICATE_EMAIL: 'Email ya registrado',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  SESSION_EXPIRED: 'La sesión ha expirado',
  INVALID_TOKEN: 'Token inválido'
};

export const SUCCESS_MESSAGES = {
  CREATED: 'Recurso creado exitosamente',
  UPDATED: 'Recurso actualizado exitosamente',
  DELETED: 'Recurso eliminado exitosamente',
  LOGIN: 'Login exitoso',
  LOGOUT: 'Logout exitoso'
};

export default {
  ROLES,
  ESTADOS,
  DISPOSITIVO_ESTADOS,
  ACCIONES_LOG,
  MODULOS,
  HTTP_STATUS,
  PAGINATION,
  VALIDATION_RULES,
  CACHE_KEYS,
  CACHE_DURATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
