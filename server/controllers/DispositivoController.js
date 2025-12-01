import DispositivoService from '../services/DispositivoService.js';
import LogService from '../services/LogService.js';
import { AppError } from '../utils/ErrorHandler.js';

/**
 * Controlador para endpoints de dispositivos
 */
export default class DispositivoController {
  constructor() {
    this.dispositivoService = new DispositivoService();
    this.logService = new LogService();
  }

  /**
   * Obtiene todos los dispositivos
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  getDispositivos = async (req, res, next) => {
    try {
      const dispositivos = await this.dispositivoService.getDispositivos(req.query, req);
      
      // Log de consulta
      if (req.session.user) {
        await this.logService.registrarActividad({
          usuario_id: req.session.user.usuario_id,
          tipo_usuario: req.session.user.rol_nombre,
          accion: 'CONSULTA',
          modulo: 'DISPOSITIVOS',
          descripcion: `Consultó listado de dispositivos. Filtros: ${JSON.stringify(req.query)}`,
          metadata: { filtros: req.query, total: dispositivos.length }
        }, req);
      }

      res.json({
        success: true,
        data: dispositivos,
        count: dispositivos.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene un dispositivo por ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  getDispositivoById = async (req, res, next) => {
    try {
      const dispositivo = await this.dispositivoService.getDispositivoById(
        parseInt(req.params.id), 
        req
      );
      
      // Log de consulta
      if (req.session.user) {
        await this.logService.registrarActividad({
          usuario_id: req.session.user.usuario_id,
          tipo_usuario: req.session.user.rol_nombre,
          accion: 'CONSULTA',
          modulo: 'DISPOSITIVOS',
          descripcion: `Consultó detalles del dispositivo: ${dispositivo.nombre}`,
          recurso_afectado: 'Dispositivo',
          id_recurso_afectado: dispositivo.dispositivo_id,
          metadata: { dispositivo_id: dispositivo.dispositivo_id }
        }, req);
      }

      res.json({
        success: true,
        data: dispositivo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crea un nuevo dispositivo
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  createDispositivo = async (req, res, next) => {
    try {
      const imageFilename = req.file ? req.file.filename : null;
      const result = await this.dispositivoService.createDispositivo(req.body, imageFilename);
      
      // Log de creación
      await this.logService.registrarActividadAdmin(
        req.session.user,
        'CREACION',
        'DISPOSITIVOS',
        `Creó nuevo dispositivo: ${req.body.nombre}`,
        req,
        { 
          dispositivo_id: result.id,
          nombre: req.body.nombre,
          precio: req.body.precio,
          imagen_subida: !!imageFilename
        }
      );

      res.status(201).json({
        success: true,
        message: 'Dispositivo creado exitosamente',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualiza un dispositivo existente
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  updateDispositivo = async (req, res, next) => {
    try {
      const imageFilename = req.file ? req.file.filename : null;
      const result = await this.dispositivoService.updateDispositivo(
        parseInt(req.params.id), 
        req.body, 
        imageFilename
      );
      
      // Log de actualización
      await this.logService.registrarActividadAdmin(
        req.session.user,
        'ACTUALIZACION',
        'DISPOSITIVOS',
        `Actualizó dispositivo ID: ${req.params.id}`,
        req,
        { 
          dispositivo_id: parseInt(req.params.id),
          campos_actualizados: Object.keys(req.body),
          imagen_actualizada: !!imageFilename
        }
      );

      res.json({
        success: true,
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Elimina un dispositivo
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  deleteDispositivo = async (req, res, next) => {
    try {
      const result = await this.dispositivoService.deleteDispositivo(parseInt(req.params.id));
      
      // Log de eliminación
      await this.logService.registrarActividadAdmin(
        req.session.user,
        'ELIMINACION',
        'DISPOSITIVOS',
        `Eliminó dispositivo ID: ${req.params.id}`,
        req,
        { dispositivo_id: parseInt(req.params.id) }
      );

      res.json({
        success: true,
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene estadísticas de dispositivos
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  getEstadisticas = async (req, res, next) => {
    try {
      const estadisticas = await this.dispositivoService.getEstadisticas();
      
      res.json({
        success: true,
        data: estadisticas,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Busca dispositivos
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  searchDispositivos = async (req, res, next) => {
    try {
      const { q } = req.query;
      
      if (!q) {
        throw new AppError('Término de búsqueda requerido', 400);
      }

      const dispositivos = await this.dispositivoService.searchDispositivos(q, req);
      
      // Log de búsqueda
      if (req.session.user) {
        await this.logService.registrarActividad({
          usuario_id: req.session.user.usuario_id,
          tipo_usuario: req.session.user.rol_nombre,
          accion: 'BUSQUEDA',
          modulo: 'DISPOSITIVOS',
          descripcion: `Buscó dispositivos: "${q}"`,
          metadata: { termino: q, resultados: dispositivos.length }
        }, req);
      }

      res.json({
        success: true,
        data: dispositivos,
        count: dispositivos.length,
        termino: q,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };
}