import LogModel from '../models/LogModel.js';

/**
 * Servicio para gestión de logs del sistema
 */
export default class LogService {
  constructor() {
    this.logModel = new LogModel();
  }

  /**
   * Registra una actividad en el sistema
   * @param {Object} datosActividad - Datos de la actividad
   * @param {Object} req - Request object (opcional)
   * @returns {Promise<Object>} Log registrado
   */
  async registrarActividad(datosActividad, req = null) {
    try {
      const datosLog = {
        ...datosActividad,
        ip_address: req ? this._obtenerIp(req) : null,
        user_agent: req ? req.get('User-Agent') : null
      };

      return await this.logModel.registrarActividad(datosLog);
    } catch (error) {
      // No lanzar error para no interrumpir el flujo principal
      console.error('Error registrando log:', error);
      return null;
    }
  }

  /**
   * Registra actividad de administrador
   * @param {Object} usuario - Usuario administrador
   * @param {string} accion - Acción realizada
   * @param {string} modulo - Módulo afectado
   * @param {string} descripcion - Descripción detallada
   * @param {Object} req - Request object
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Promise<Object>} Log registrado
   */
  async registrarActividadAdmin(usuario, accion, modulo, descripcion, req = null, metadata = {}) {
    return await this.registrarActividad({
      usuario_id: usuario.usuario_id,
      tipo_usuario: 'Administrador',
      accion,
      modulo,
      descripcion,
      recurso_afectado: metadata.recurso_afectado || null,
      id_recurso_afectado: metadata.id_recurso_afectado || null,
      metadata
    }, req);
  }

  /**
   * Registra actividad de vendedor
   * @param {Object} usuario - Usuario vendedor
   * @param {string} accion - Acción realizada
   * @param {string} modulo - Módulo afectado
   * @param {string} descripcion - Descripción detallada
   * @param {Object} req - Request object
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Promise<Object>} Log registrado
   */
  async registrarActividadVendedor(usuario, accion, modulo, descripcion, req = null, metadata = {}) {
    return await this.registrarActividad({
      usuario_id: usuario.usuario_id,
      tipo_usuario: 'Vendedor',
      accion,
      modulo,
      descripcion,
      recurso_afectado: metadata.recurso_afectado || null,
      id_recurso_afectado: metadata.id_recurso_afectado || null,
      metadata
    }, req);
  }

  /**
   * Registra actividad de cliente
   * @param {Object} usuario - Usuario cliente
   * @param {string} accion - Acción realizada
   * @param {string} modulo - Módulo afectado
   * @param {string} descripcion - Descripción detallada
   * @param {Object} req - Request object
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Promise<Object>} Log registrado
   */
  async registrarActividadCliente(usuario, accion, modulo, descripcion, req = null, metadata = {}) {
    return await this.registrarActividad({
      usuario_id: usuario.usuario_id,
      tipo_usuario: 'Cliente',
      accion,
      modulo,
      descripcion,
      recurso_afectado: metadata.recurso_afectado || null,
      id_recurso_afectado: metadata.id_recurso_afectado || null,
      metadata
    }, req);
  }

  /**
   * Registra actividad del sistema
   * @param {string} accion - Acción realizada
   * @param {string} modulo - Módulo afectado
   * @param {string} descripcion - Descripción detallada
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Promise<Object>} Log registrado
   */
  async registrarActividadSistema(accion, modulo, descripcion, metadata = {}) {
    return await this.registrarActividad({
      tipo_usuario: 'Sistema',
      accion,
      modulo,
      descripcion,
      recurso_afectado: metadata.recurso_afectado || null,
      id_recurso_afectado: metadata.id_recurso_afectado || null,
      metadata
    });
  }

  /**
   * Obtiene logs con filtros
   * @param {Object} filtros - Filtros de búsqueda
   * @param {number} pagina - Página actual
   * @param {number} limite - Límite por página
   * @returns {Promise<Object>} Logs y paginación
   */
  async obtenerLogs(filtros = {}, pagina = 1, limite = 50) {
    return await this.logModel.obtenerLogsConFiltros(filtros, pagina, limite);
  }

  /**
   * Obtiene estadísticas de actividad
   * @param {string} periodo - Periodo para estadísticas
   * @returns {Promise<Object>} Estadísticas
   */
  async obtenerEstadisticas(periodo = 'dia') {
    return await this.logModel.obtenerEstadisticas(periodo);
  }

  /**
   * Obtiene actividades recientes de un usuario
   * @param {number} usuarioId - ID del usuario
   * @param {number} limite - Límite de resultados
   * @returns {Promise<Array>} Actividades recientes
   */
  async obtenerActividadesUsuario(usuarioId, limite = 20) {
    return await this.logModel.obtenerActividadesUsuario(usuarioId, limite);
  }

  /**
   * Limpia logs antiguos
   * @param {number} diasMantener - Días a mantener
   * @returns {Promise<Object>} Resultado de la limpieza
   */
  async limpiarLogsAntiguos(diasMantener = 90) {
    return await this.logModel.limpiarLogsAntiguos(diasMantener);
  }

  /**
   * Obtiene IP del cliente
   * @param {Object} req - Request object
   * @returns {string} IP address
   * @private
   */
  _obtenerIp(req) {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           '127.0.0.1';
  }
}