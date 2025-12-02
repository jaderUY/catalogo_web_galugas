import database from '../config/database.js';

/**
 * CategoriaModel - wrapper de acceso a la tabla `Categoria`.
 * Proporciona la interfaz esperada por los servicios: findAll, findById, create, update, delete
 */
export default class CategoriaModel {
  constructor() {
    this.table = 'Categoria';
    this.idField = 'categoria_id';
  }

  async findAll(where = {}) {
    try {
      const conditions = [];
      const params = [];

      Object.keys(where).forEach((key) => {
        conditions.push(`${key} = ?`);
        params.push(where[key]);
      });

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const query = `SELECT * FROM ${this.table} ${whereClause} ORDER BY nombre`;

      const results = await database.execute(query, params);
      return results;
    } catch (error) {
      console.error('CategoriaModel.findAll error:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const query = `SELECT * FROM ${this.table} WHERE ${this.idField} = ? LIMIT 1`;
      const results = await database.execute(query, [id]);
      return results.length ? results[0] : null;
    } catch (error) {
      console.error('CategoriaModel.findById error:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const fields = [];
      const placeholders = [];
      const params = [];

      Object.keys(data).forEach((key) => {
        fields.push(key);
        placeholders.push('?');
        params.push(data[key]);
      });

      const query = `INSERT INTO ${this.table} (${fields.join(',')}) VALUES (${placeholders.join(',')})`;
      const result = await database.execute(query, params);

      // obtener recién insertado
      const insertedId = result.insertId;
      return this.findById(insertedId);
    } catch (error) {
      console.error('CategoriaModel.create error:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const sets = [];
      const params = [];

      Object.keys(data).forEach((key) => {
        sets.push(`${key} = ?`);
        params.push(data[key]);
      });

      if (!sets.length) return null;

      params.push(id);
      const query = `UPDATE ${this.table} SET ${sets.join(', ')} WHERE ${this.idField} = ?`;
      const result = await database.execute(query, params);

      if (result.affectedRows === 0) return null;
      return this.findById(id);
    } catch (error) {
      console.error('CategoriaModel.update error:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      // Intentar eliminar; si hay FK, la base de datos lanzará error
      const query = `DELETE FROM ${this.table} WHERE ${this.idField} = ?`;
      const result = await database.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      // Si es error de FK, reportarlo de forma legible
      if (error && (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED')) {
        const e = new Error('No se puede eliminar la categoría porque tiene dispositivos asociados');
        e.code = error.code;
        throw e;
      }
      console.error('CategoriaModel.delete error:', error);
      throw error;
    }
  }
}
