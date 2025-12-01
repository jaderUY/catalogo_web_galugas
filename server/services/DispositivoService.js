import DispositivoModel from '../models/DispositivoModel.js';
import { AppError } from '../utils/ErrorHandler.js';

/**
 * Servicio para la lógica de negocio de dispositivos
 */
export default class DispositivoService {
  constructor() {
    this.dispositivoModel = new DispositivoModel();
  }

  /**
   * Obtiene todos los dispositivos con filtros
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} req - Request object para construir URLs
   * @returns {Promise<Array>} Dispositivos procesados
   */
  async getDispositivos(filters = {}, req) {
    try {
      const dispositivos = await this.dispositivoModel.findAllWithDetails(filters);
      
      return dispositivos.map(dispositivo => 
        this._enrichDispositivoWithUrls(dispositivo, req)
      );
    } catch (error) {
      throw new AppError(`Error obteniendo dispositivos: ${error.message}`, 500);
    }
  }

  /**
   * Obtiene un dispositivo por ID
   * @param {number} id - ID del dispositivo
   * @param {Object} req - Request object
   * @returns {Promise<Object>} Dispositivo enriquecido
   */
  async getDispositivoById(id, req) {
    const dispositivo = await this.dispositivoModel.findByIdWithDetails(id);
    
    if (!dispositivo) {
      throw new AppError('Dispositivo no encontrado', 404);
    }

    return this._enrichDispositivoWithUrls(dispositivo, req);
  }

  /**
   * Crea un nuevo dispositivo
   * @param {Object} dispositivoData - Datos del dispositivo
   * @param {string} imageFilename - Nombre del archivo de imagen
   * @returns {Promise<Object>} Dispositivo creado
   */
  async createDispositivo(dispositivoData, imageFilename = null) {
    // Validar datos requeridos
    this._validateDispositivoData(dispositivoData);

    const data = {
      ...dispositivoData,
      pathFoto: imageFilename,
      estado_id: 1 // Activo por defecto
    };

    // Convertir tipos de datos
    if (data.precio) data.precio = parseFloat(data.precio);
    if (data.marca_id) data.marca_id = parseInt(data.marca_id);
    if (data.categoria_id) data.categoria_id = parseInt(data.categoria_id);
    if (data.informacionTecnica_id) data.informacionTecnica_id = parseInt(data.informacionTecnica_id);

    return await this.dispositivoModel.create(data);
  }

  /**
   * Actualiza un dispositivo existente
   * @param {number} id - ID del dispositivo
   * @param {Object} dispositivoData - Datos a actualizar
   * @param {string} imageFilename - Nueva imagen (opcional)
   * @returns {Promise<Object>} Resultado de la actualización
   */
  async updateDispositivo(id, dispositivoData, imageFilename = null) {
    const existingDispositivo = await this.dispositivoModel.findById(id);
    
    if (!existingDispositivo) {
      throw new AppError('Dispositivo no encontrado', 404);
    }

    const data = {
      ...dispositivoData,
      ...(imageFilename && { pathFoto: imageFilename })
    };

    // Convertir tipos de datos
    if (data.precio) data.precio = parseFloat(data.precio);
    if (data.marca_id) data.marca_id = parseInt(data.marca_id);
    if (data.categoria_id) data.categoria_id = parseInt(data.categoria_id);
    if (data.informacionTecnica_id) data.informacionTecnica_id = parseInt(data.informacionTecnica_id);

    const updated = await this.dispositivoModel.update(id, data);
    
    if (!updated) {
      throw new AppError('Error al actualizar el dispositivo', 500);
    }

    return { message: 'Dispositivo actualizado exitosamente' };
  }

  /**
   * Elimina un dispositivo (soft delete)
   * @param {number} id - ID del dispositivo
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async deleteDispositivo(id) {
    const existingDispositivo = await this.dispositivoModel.findById(id);
    
    if (!existingDispositivo) {
      throw new AppError('Dispositivo no encontrado', 404);
    }

    const deleted = await this.dispositivoModel.delete(id);
    
    if (!deleted) {
      throw new AppError('Error al eliminar el dispositivo', 500);
    }

    return { message: 'Dispositivo eliminado exitosamente' };
  }

  /**
   * Obtiene estadísticas de dispositivos
   * @returns {Promise<Object>} Estadísticas
   */
  async getEstadisticas() {
    return await this.dispositivoModel.getEstadisticas();
  }

  /**
   * Busca dispositivos por término de búsqueda
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} req - Request object
   * @returns {Promise<Array>} Dispositivos encontrados
   */
  async searchDispositivos(searchTerm, req) {
    const filters = {
      search: searchTerm,
      estado_id: 1
    };

    const dispositivos = await this.dispositivoModel.findAllWithDetails(filters);
    
    return dispositivos.map(dispositivo => 
      this._enrichDispositivoWithUrls(dispositivo, req)
    );
  }

  /**
   * Enriquece el dispositivo con URLs completas
   * @param {Object} dispositivo - Dispositivo a enriquecer
   * @param {Object} req - Request object
   * @returns {Object} Dispositivo enriquecido
   * @private
   */
  _enrichDispositivoWithUrls(dispositivo, req) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    return {
      ...dispositivo,
      imagen_url: dispositivo.pathFoto ? 
        `${baseUrl}/uploads/${dispositivo.pathFoto}` : 
        null,
      detalles_url: `${baseUrl}/api/dispositivos/${dispositivo.dispositivo_id}`,
      promedio_calificacion: dispositivo.promedio_calificacion ? 
        parseFloat(dispositivo.promedio_calificacion) : 0
    };
  }

  /**
   * Valida los datos del dispositivo
   * @param {Object} data - Datos a validar
   * @private
   */
  _validateDispositivoData(data) {
    const required = ['nombre', 'precio', 'fechaLanzamiento', 'marca_id', 'informacionTecnica_id'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new AppError(`Campos requeridos faltantes: ${missing.join(', ')}`, 400);
    }

    if (data.precio && data.precio <= 0) {
      throw new AppError('El precio debe ser mayor a 0', 400);
    }

    if (data.fechaLanzamiento && isNaN(Date.parse(data.fechaLanzamiento))) {
      throw new AppError('Fecha de lanzamiento inválida', 400);
    }
  }
}