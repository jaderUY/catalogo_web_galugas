import LogService from '../services/LogService.js';
import { AppError } from '../utils/ErrorHandler.js';

/**
 * Controlador para gestión de logs
 */
export default class LogController {
  constructor() {
    this.logService = new LogService();
  }

  /**
   * Obtiene logs con filtros
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  obtenerLogs = async (req, res, next) => {
    try {
      const { pagina = 1, limite = 50, ...filtros } = req.query;
      
      const resultado = await this.logService.obtenerLogs(filtros, pagina, limite);
      
      res.json({
        success: true,
        data: resultado.logs,
        paginacion: resultado.paginacion,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene estadísticas de actividad
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  obtenerEstadisticas = async (req, res, next) => {
    try {
      const { periodo = 'dia' } = req.query;
      
      const estadisticas = await this.logService.obtenerEstadisticas(periodo);
      
      res.json({
        success: true,
        data: estadisticas,
        periodo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene actividades recientes del usuario actual
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  obtenerMisActividades = async (req, res, next) => {
    try {
      if (!req.session.user) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const { limite = 20 } = req.query;
      const actividades = await this.logService.obtenerActividadesUsuario(
        req.session.user.usuario_id, 
        parseInt(limite)
      );
      
      res.json({
        success: true,
        data: actividades,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Exporta logs a formato CSV
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  exportarLogs = async (req, res, next) => {
    try {
      const { ...filtros } = req.query;
      
      const resultado = await this.logService.obtenerLogs(filtros, 1, 10000); // Máximo 10,000 registros
      
      // Convertir a CSV
      const csv = this._convertirACSV(resultado.logs);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=logs_galugas_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Limpia logs antiguos
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  limpiarLogsAntiguos = async (req, res, next) => {
    try {
      const { dias = 90 } = req.body;
      
      const resultado = await this.logService.limpiarLogsAntiguos(parseInt(dias));
      
      // Registrar esta acción
      await this.logService.registrarActividadAdmin(
        req.session.user,
        'MANTENIMIENTO',
        'SISTEMA',
        `Limpieza de logs antiguos: ${resultado.eliminados} registros eliminados`,
        req,
        { dias_mantenidos: dias }
      );
      
      res.json({
        success: true,
        data: resultado,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Convierte logs a formato CSV
   * @param {Array} logs - Array de logs
   * @returns {string} CSV
   * @private
   */
  _convertirACSV(logs) {
    const headers = [
      'ID', 'Fecha', 'Usuario', 'Tipo Usuario', 'Módulo', 'Acción', 
      'Descripción', 'Recurso Afectado', 'IP Address', 'User Agent'
    ];
    
    let csv = headers.join(',') + '\n';
    
    logs.forEach(log => {
      const row = [
        log.log_id,
        `"${new Date(log.fecha_creacion).toISOString()}"`,
        `"${log.primer_nombre || 'Sistema'} ${log.primer_apellido || ''}"`,
        `"${log.tipo_usuario}"`,
        `"${log.modulo}"`,
        `"${log.accion}"`,
        `"${(log.descripcion || '').replace(/"/g, '""')}"`,
        `"${log.recurso_afectado || ''}"`,
        `"${log.ip_address || ''}"`,
        `"${(log.user_agent || '').replace(/"/g, '""')}"`
      ];
      
      csv += row.join(',') + '\n';
    });
    
    return csv;
  }
}