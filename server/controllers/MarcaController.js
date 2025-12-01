import MarcaService from '../services/MarcaService.js';
import LogService from '../services/LogService.js';
import { AppError } from '../utils/ErrorHandler.js';

/**
 * Controlador para endpoints de marcas
 */
export default class MarcaController {
  constructor() {
    this.marcaService = new MarcaService();
    this.logService = new LogService();
  }

  /**
   * Obtiene todas las marcas
   */
  getMarcas = async (req, res, next) => {
    try {
      const marcas = await this.marcaService.getMarcas();
      
      res.json({
        success: true,
        data: marcas,
        count: marcas.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene una marca por ID
   */
  getMarcaById = async (req, res, next) => {
    try {
      const marca = await this.marcaService.getMarcaById(parseInt(req.params.id));
      
      res.json({
        success: true,
        data: marca,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crea una nueva marca
   */
  createMarca = async (req, res, next) => {
    try {
      const result = await this.marcaService.createMarca(req.body);
      
      // Log de creación
      await this.logService.registrarActividadAdmin(
        req.session.user,
        'CREACION',
        'MARCAS',
        `Creó nueva marca: ${req.body.nombre}`,
        req,
        { marca_id: result.id, nombre: req.body.nombre }
      );

      res.status(201).json({
        success: true,
        message: 'Marca creada exitosamente',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualiza una marca existente
   */
  updateMarca = async (req, res, next) => {
    try {
      const result = await this.marcaService.updateMarca(parseInt(req.params.id), req.body);
      
      // Log de actualización
      await this.logService.registrarActividadAdmin(
        req.session.user,
        'ACTUALIZACION',
        'MARCAS',
        `Actualizó marca ID: ${req.params.id}`,
        req,
        { marca_id: parseInt(req.params.id), campos_actualizados: Object.keys(req.body) }
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
   * Elimina una marca
   */
  deleteMarca = async (req, res, next) => {
    try {
      const result = await this.marcaService.deleteMarca(parseInt(req.params.id));
      
      // Log de eliminación
      await this.logService.registrarActividadAdmin(
        req.session.user,
        'ELIMINACION',
        'MARCAS',
        `Eliminó marca ID: ${req.params.id}`,
        req,
        { marca_id: parseInt(req.params.id) }
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
}