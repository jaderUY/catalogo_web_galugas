import BaseModel from './BaseModel.js';

/**
 * Modelo para la entidad InformacionTecnica
 * @extends BaseModel
 */
export default class InformacionTecnicaModel extends BaseModel {
  constructor() {
    super('InformacionTecnica');
  }

  /**
   * Crea información técnica y retorna el ID creado
   * @param {Object} data - Datos de la información técnica
   * @returns {Promise<number>} ID de la información técnica creada
   */
  async createAndReturnId(data) {
    const result = await this.create(data);
    return result.id;
  }
}