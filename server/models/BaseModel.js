import database from '../config/database.js';
import { AppError } from '../utils/ErrorHandler.js';

/**
 * Clase base abstracta para todos los modelos
 * Implementa operaciones CRUD básicas
 */
export default class BaseModel {
  constructor(tableName) {
    if (this.constructor === BaseModel) {
      throw new Error('BaseModel is an abstract class and cannot be instantiated directly');
    }
    this.tableName = tableName;
  }

  /**
   * Ejecuta una consulta SQL
   * @param {string} query - Consulta SQL
   * @param {Array} params - Parámetros para la consulta
   * @returns {Promise} Resultado de la consulta
   */
  async execute(query, params = []) {
    try {
      return await database.execute(query, params);
    } catch (error) {
      console.error(`Database error in ${this.tableName}:`, error);
      throw new AppError(`Error de base de datos: ${error.message}`, 500);
    }
  }

  /**
   * Encuentra todos los registros
   * @param {Object} where - Condiciones WHERE
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Array>} Array de registros
   */
  async findAll(where = {}, options = {}) {
    let query = `SELECT * FROM ${this.tableName}`;
    const params = [];
    
    const conditions = Object.keys(where);
    if (conditions.length > 0) {
      const whereClause = conditions.map(key => `${key} = ?`).join(' AND ');
      query += ` WHERE ${whereClause}`;
      params.push(...Object.values(where));
    }

    // Ordenamiento
    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
      if (options.orderDirection) {
        query += ` ${options.orderDirection.toUpperCase()}`;
      }
    }

    // Límite y offset
    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
      if (options.offset) {
        query += ` OFFSET ${options.offset}`;
      }
    }

    return await this.execute(query, params);
  }

  /**
   * Encuentra un registro por ID
   * @param {number} id - ID del registro
   * @returns {Promise<Object>} Registro encontrado
   */
  async findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE ${this.getPrimaryKey()} = ?`;
    const result = await this.execute(query, [id]);
    return result[0] || null;
  }

  /**
   * Crea un nuevo registro
   * @param {Object} data - Datos del registro
   * @returns {Promise<Object>} Registro creado
   */
  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const query = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    const result = await this.execute(query, values);
    
    return { id: result.insertId, ...data };
  }

  /**
   * Actualiza un registro
   * @param {number} id - ID del registro
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<boolean>} True si se actualizó
   */
  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    if (keys.length === 0) {
      throw new AppError('No hay datos para actualizar', 400);
    }
    
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE ${this.getPrimaryKey()} = ?`;
    
    const result = await this.execute(query, [...values, id]);
    return result.affectedRows > 0;
  }

  /**
   * Elimina un registro (soft delete si existe estado_id)
   * @param {number} id - ID del registro
   * @returns {Promise<boolean>} True si se eliminó
   */
  async delete(id) {
    // Verificar si la tabla tiene estado_id para soft delete
    const hasEstado = await this.hasEstadoField();
    if (hasEstado) {
      const query = `UPDATE ${this.tableName} SET estado_id = 2 WHERE ${this.getPrimaryKey()} = ?`;
      const result = await this.execute(query, [id]);
      return result.affectedRows > 0;
    } else {
      const query = `DELETE FROM ${this.tableName} WHERE ${this.getPrimaryKey()} = ?`;
      const result = await this.execute(query, [id]);
      return result.affectedRows > 0;
    }
  }

  /**
   * Cuenta el total de registros
   * @param {Object} where - Condiciones WHERE
   * @returns {Promise<number>} Total de registros
   */
  async count(where = {}) {
    let query = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    const params = [];
    
    const conditions = Object.keys(where);
    if (conditions.length > 0) {
      const whereClause = conditions.map(key => `${key} = ?`).join(' AND ');
      query += ` WHERE ${whereClause}`;
      params.push(...Object.values(where));
    }
    
    const result = await this.execute(query, params);
    return result[0].total;
  }

  /**
   * Obtiene el nombre de la clave primaria
   * @returns {string} Nombre de la clave primaria
   */
  getPrimaryKey() {
    return `${this.tableName.toLowerCase()}_id`;
  }

  /**
   * Verifica si la tabla tiene campo estado_id
   * @returns {Promise<boolean>} True si tiene estado_id
   */
  async hasEstadoField() {
    try {
      const query = `SHOW COLUMNS FROM ${this.tableName} LIKE 'estado_id'`;
      const result = await this.execute(query);
      return result.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Ejecuta una transacción
   * @param {Function} callback - Función a ejecutar en la transacción
   * @returns {Promise} Resultado de la transacción
   */
  async transaction(callback) {
    const transaction = await database.beginTransaction();
    
    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}