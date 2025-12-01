import LogService from '../services/LogService.js';

const logService = new LogService();

/**
 * Middleware para logging automático de actividades
 */
export class LoggingMiddleware {
  /**
   * Middleware para loggear requests HTTP
   */
  logRequests = () => {
    return (req, res, next) => {
      // No loggear requests estáticos o de health check
      if (this._shouldSkipLogging(req)) {
        return next();
      }

      const startTime = Date.now();
      const user = req.session.user;

      // Función para ejecutar después de que se complete la response
      res.on('finish', async () => {
        try {
          const duration = Date.now() - startTime;
          
          // Determinar tipo de acción basado en el método HTTP y status code
          const accion = this._determinarAccion(req.method, res.statusCode);
          const modulo = this._determinarModulo(req.path);
          
          if (user) {
            // Usuario autenticado
            const descripcion = this._generarDescripcion(req, res, duration, user);
            
            const metadata = {
              metodo: req.method,
              ruta: req.path,
              statusCode: res.statusCode,
              duracion_ms: duration,
              user_agent: req.get('User-Agent'),
              parametros: this._sanitizarParametros(req)
            };

            await logService.registrarActividad({
              usuario_id: user.usuario_id,
              tipo_usuario: user.rol_nombre,
              accion,
              modulo,
              descripcion,
              metadata
            }, req);
          } else {
            // Usuario no autenticado o sistema
            const descripcion = `Acción ${accion} en ${modulo} - Status: ${res.statusCode} - Duración: ${duration}ms`;
            
            await logService.registrarActividad({
              tipo_usuario: 'Sistema',
              accion,
              modulo,
              descripcion,
              metadata: {
                metodo: req.method,
                ruta: req.path,
                statusCode: res.statusCode,
                duracion_ms: duration
              }
            }, req);
          }
        } catch (error) {
          console.error('Error en middleware de logging:', error);
        }
      });

      next();
    };
  };

  /**
   * Verifica si se debe saltar el logging
   * @param {Object} req - Request object
   * @returns {boolean} True si se debe saltar
   * @private
   */
  _shouldSkipLogging(req) {
    const skippedPaths = [
      '/health',
      '/favicon.ico',
      '/uploads/',
      '/css/',
      '/js/',
      '/images/',
      '/api/logs' // Evitar recursividad en logs
    ];

    return skippedPaths.some(path => req.path.startsWith(path));
  }

  /**
   * Determina la acción basada en el método HTTP y status code
   * @param {string} method - Método HTTP
   * @param {number} statusCode - Status code
   * @returns {string} Acción
   * @private
   */
  _determinarAccion(method, statusCode) {
    const acciones = {
      'GET': statusCode === 200 ? 'CONSULTA' : 'ERROR_CONSULTA',
      'POST': statusCode < 400 ? 'CREACION' : 'ERROR_CREACION',
      'PUT': statusCode < 400 ? 'ACTUALIZACION' : 'ERROR_ACTUALIZACION',
      'PATCH': statusCode < 400 ? 'ACTUALIZACION' : 'ERROR_ACTUALIZACION',
      'DELETE': statusCode < 400 ? 'ELIMINACION' : 'ERROR_ELIMINACION'
    };

    return acciones[method] || 'ACCESO';
  }

  /**
   * Determina el módulo basado en la ruta
   * @param {string} path - Ruta del request
   * @returns {string} Módulo
   * @private
   */
  _determinarModulo(path) {
    if (path.includes('/admin')) return 'PANEL_ADMIN';
    if (path.includes('/dispositivos')) return 'DISPOSITIVOS';
    if (path.includes('/categorias')) return 'CATEGORIAS';
    if (path.includes('/marcas')) return 'MARCAS';
    if (path.includes('/auth')) return 'AUTENTICACION';
    if (path.includes('/usuarios')) return 'USUARIOS';
    if (path.includes('/logs')) return 'LOGS';
    if (path.includes('/api')) return 'API';
    
    return 'SISTEMA';
  }

  /**
   * Genera descripción detallada del log
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {number} duration - Duración en ms
   * @param {Object} user - Usuario
   * @returns {string} Descripción
   * @private
   */
  _generarDescripcion(req, res, duration, user) {
    const nombreUsuario = `${user.primer_nombre} ${user.primer_apellido}`;
    return `${nombreUsuario} realizó ${req.method} en ${req.path} - Status: ${res.statusCode} - Duración: ${duration}ms`;
  }

  /**
   * Sanitiza parámetros para no loggear información sensible
   * @param {Object} req - Request object
   * @returns {Object} Parámetros sanitizados
   * @private
   */
  _sanitizarParametros(req) {
    const sanitized = { 
      ...(req.query && { query: req.query }),
      ...(req.body && { body: this._removeSensitiveFields(req.body) })
    };
    
    return sanitized;
  }

  /**
   * Remueve campos sensibles del objeto
   * @param {Object} obj - Objeto a sanitizar
   * @returns {Object} Objeto sanitizado
   * @private
   */
  _removeSensitiveFields(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const sensitiveFields = [
      'password', 'contrasena', 'token', 'authorization', 
      'secret', 'api_key', 'access_token', 'refresh_token'
    ];
    
    const sanitized = { ...obj };
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***SENSITIVE***';
      }
    });
    
    return sanitized;
  }
}

export default new LoggingMiddleware();