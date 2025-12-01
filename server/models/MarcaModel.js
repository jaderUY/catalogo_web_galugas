import BaseModel from './BaseModel.js';

/**
 * Modelo para la entidad Marca
 * @extends BaseModel
 */
export default class MarcaModel extends BaseModel {
  constructor() {
    super('Marca');
  }

  /**
   * Encuentra todas las marcas con información del país
   * @returns {Promise<Array>} Array de marcas
   */
  async findAllWithDetails() {
    const query = `
      SELECT 
        m.*, 
        p.nombre as pais_nombre,
        e.nombre as estado_nombre
      FROM Marca m
      LEFT JOIN Pais p ON m.pais_id = p.pais_id
      LEFT JOIN Estado e ON m.estado_id = e.estado_id
      WHERE m.estado_id = 1
      ORDER BY m.nombre
    `;
    
    return await this.execute(query);
  }

  /**
   * Encuentra una marca por ID con información del país
   * @param {number} id - ID de la marca
   * @returns {Promise<Object>} Marca con detalles
   */
  async findByIdWithDetails(id) {
    const query = `
      SELECT 
        m.*, 
        p.nombre as pais_nombre,
        e.nombre as estado_nombre
      FROM Marca m
      LEFT JOIN Pais p ON m.pais_id = p.pais_id
      LEFT JOIN Estado e ON m.estado_id = e.estado_id
      WHERE m.marca_id = ? AND m.estado_id = 1
    `;
    
    const result = await this.execute(query, [id]);
    return result[0] || null;
  }

  /**
   * Obtiene marcas por país
   * @param {number} paisId - ID del país
   * @returns {Promise<Array>} Array de marcas
   */
  async findByPais(paisId) {
    const query = `
      SELECT * FROM Marca 
      WHERE pais_id = ? AND estado_id = 1 
      ORDER BY nombre
    `;
    
    return await this.execute(query, [paisId]);
  }
}