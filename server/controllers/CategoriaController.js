import CategoriaService from '../services/CategoriaService.js';
import LogService from '../services/LogService.js';
import { AppError } from '../utils/ErrorHandler.js';

/**
 * Controlador para endpoints de categorías
 */
export default class CategoriaController {
  constructor() {
    this.categoriaService = new CategoriaService();
    this.logService = new LogService();
  }

  /**
   * Obtiene todas las categorías
   */
  getCategorias = async (req, res, next) => {
    try {
      const categorias = await this.categoriaService.getCategorias();
      
      res.json({
        success: true,
        data: categorias,
        count: categorias.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene una categoría por ID
   */
  getCategoriaById = async (req, res, next) => {
    try {
      const categoria = await this.categoriaService.getCategoriaById(parseInt(req.params.id));
      
      res.json({
        success: true,
        data: categoria,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crea una nueva categoría
   */
  createCategoria = async (req, res, next) => {
    try {
      const result = await this.categoriaService.createCategoria(req.body);
      
      // Log de creación
      await this.logService.registrarActividadAdmin(
        req.session.user,
        'CREACION',
        'CATEGORIAS',
        `Creó nueva categoría: ${req.body.nombre}`,
        req,
        { categoria_id: result.id, nombre: req.body.nombre }
      );

      res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualiza una categoría existente
   */
  updateCategoria = async (req, res, next) => {
    try {
      const result = await this.categoriaService.updateCategoria(parseInt(req.params.id), req.body);
      
      // Log de actualización
      await this.logService.registrarActividadAdmin(
        req.session.user,
        'ACTUALIZACION',
        'CATEGORIAS',
        `Actualizó categoría ID: ${req.params.id}`,
        req,
        { categoria_id: parseInt(req.params.id), campos_actualizados: Object.keys(req.body) }
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
   * Elimina una categoría
   */
  deleteCategoria = async (req, res, next) => {
    try {
      const result = await this.categoriaService.deleteCategoria(parseInt(req.params.id));
      
      // Log de eliminación
      await this.logService.registrarActividadAdmin(
        req.session.user,
        'ELIMINACION',
        'CATEGORIAS',
        `Eliminó categoría ID: ${req.params.id}`,
        req,
        { categoria_id: parseInt(req.params.id) }
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