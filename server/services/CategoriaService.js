import CategoriaModel from '../models/CategoriaModel.js';
import { AppError } from '../utils/ErrorHandler.js';

/**
 * Servicio para la lógica de negocio de categorías
 */
export default class CategoriaService {
  constructor() {
    this.categoriaModel = new CategoriaModel();
  }

  /**
   * Obtiene todas las categorías
   */
  async getCategorias() {
    try {
      return await this.categoriaModel.findAll({ estado_id: 1 });
    } catch (error) {
      throw new AppError(`Error obteniendo categorías: ${error.message}`, 500);
    }
  }

  /**
   * Obtiene una categoría por ID
   */
  async getCategoriaById(id) {
    const categoria = await this.categoriaModel.findById(id);
    
    if (!categoria) {
      throw new AppError('Categoría no encontrada', 404);
    }

    return categoria;
  }

  /**
   * Crea una nueva categoría
   */
  async createCategoria(categoriaData) {
    this._validateCategoriaData(categoriaData);

    const data = {
      ...categoriaData,
      estado_id: 1 // Activo por defecto
    };

    return await this.categoriaModel.create(data);
  }

  /**
   * Actualiza una categoría existente
   */
  async updateCategoria(id, categoriaData) {
    const existingCategoria = await this.categoriaModel.findById(id);
    
    if (!existingCategoria) {
      throw new AppError('Categoría no encontrada', 404);
    }

    const updated = await this.categoriaModel.update(id, categoriaData);
    
    if (!updated) {
      throw new AppError('Error al actualizar la categoría', 500);
    }

    return { message: 'Categoría actualizada exitosamente' };
  }

  /**
   * Elimina una categoría (soft delete)
   */
  async deleteCategoria(id) {
    const existingCategoria = await this.categoriaModel.findById(id);
    
    if (!existingCategoria) {
      throw new AppError('Categoría no encontrada', 404);
    }

    const deleted = await this.categoriaModel.delete(id);
    
    if (!deleted) {
      throw new AppError('Error al eliminar la categoría', 500);
    }

    return { message: 'Categoría eliminada exitosamente' };
  }

  /**
   * Valida los datos de la categoría
   */
  _validateCategoriaData(data) {
    if (!data.nombre) {
      throw new AppError('El nombre de la categoría es requerido', 400);
    }

    if (data.nombre.length < 2) {
      throw new AppError('El nombre debe tener al menos 2 caracteres', 400);
    }
  }
}