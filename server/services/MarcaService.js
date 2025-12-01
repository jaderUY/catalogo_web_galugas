import MarcaModel from '../models/MarcaModel.js';
import { AppError } from '../utils/ErrorHandler.js';

/**
 * Servicio para la lógica de negocio de marcas
 */
export default class MarcaService {
  constructor() {
    this.marcaModel = new MarcaModel();
  }

  /**
   * Obtiene todas las marcas
   */
  async getMarcas() {
    try {
      return await this.marcaModel.findAllWithDetails();
    } catch (error) {
      throw new AppError(`Error obteniendo marcas: ${error.message}`, 500);
    }
  }

  /**
   * Obtiene una marca por ID
   */
  async getMarcaById(id) {
    const marca = await this.marcaModel.findByIdWithDetails(id);
    
    if (!marca) {
      throw new AppError('Marca no encontrada', 404);
    }

    return marca;
  }

  /**
   * Crea una nueva marca
   */
  async createMarca(marcaData) {
    this._validateMarcaData(marcaData);

    const data = {
      ...marcaData,
      estado_id: 1 // Activo por defecto
    };

    return await this.marcaModel.create(data);
  }

  /**
   * Actualiza una marca existente
   */
  async updateMarca(id, marcaData) {
    const existingMarca = await this.marcaModel.findById(id);
    
    if (!existingMarca) {
      throw new AppError('Marca no encontrada', 404);
    }

    const updated = await this.marcaModel.update(id, marcaData);
    
    if (!updated) {
      throw new AppError('Error al actualizar la marca', 500);
    }

    return { message: 'Marca actualizada exitosamente' };
  }

  /**
   * Elimina una marca (soft delete)
   */
  async deleteMarca(id) {
    const existingMarca = await this.marcaModel.findById(id);
    
    if (!existingMarca) {
      throw new AppError('Marca no encontrada', 404);
    }

    const deleted = await this.marcaModel.delete(id);
    
    if (!deleted) {
      throw new AppError('Error al eliminar la marca', 500);
    }

    return { message: 'Marca eliminada exitosamente' };
  }

  /**
   * Valida los datos de la marca
   */
  _validateMarcaData(data) {
    if (!data.nombre) {
      throw new AppError('El nombre de la marca es requerido', 400);
    }

    if (!data.pais_id) {
      throw new AppError('El país de la marca es requerido', 400);
    }

    if (data.nombre.length < 2) {
      throw new AppError('El nombre debe tener al menos 2 caracteres', 400);
    }
  }
}