// Modelo para la tabla Categoria de la base de datos DB_Galugas_web
const db = require('../config/db');

const CategoricalModel = {
  /**
   * Obtener todas las categorías
   * @returns {Promise<Array>} Lista de categorías
   */
  async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM Categoria ORDER BY nombre');
      return rows;
    } catch (error) {
      console.error('Error en getAll de CategoricalModel:', error);
      throw error;
    }
  },

  /**
   * Obtener una categoría por ID
   * @param {number} id - ID de la categoría
   * @returns {Promise<Object|null>} Categoría encontrada o null
   */
  async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM Categoria WHERE categoria_id = ?', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(`Error en getById(${id}) de CategoricalModel:`, error);
      throw error;
    }
  },

  /**
   * Crear una nueva categoría
   * @param {Object} categoriaData - Datos de la categoría
   * @param {string} categoriaData.nombre - Nombre de la categoría
   * @param {string} categoriaData.descripcion - Descripción (opcional)
   * @returns {Promise<Object>} Categoría creada
   */
  async create(categoriaData) {
    try {
      const { nombre, descripcion } = categoriaData;
      const [result] = await db.query(
        'INSERT INTO Categoria (nombre, descripcion) VALUES (?, ?)',
        [nombre, descripcion || null]
      );
      
      // Obtener la categoría recién creada
      return await this.getById(result.insertId);
    } catch (error) {
      console.error('Error en create de CategoricalModel:', error);
      throw error;
    }
  },

  /**
   * Actualizar una categoría existente
   * @param {number} id - ID de la categoría a actualizar
   * @param {Object} categoriaData - Nuevos datos de la categoría
   * @returns {Promise<Object|null>} Categoría actualizada o null
   */
  async update(id, categoriaData) {
    try {
      const { nombre, descripcion } = categoriaData;
      const [result] = await db.query(
        'UPDATE Categoria SET nombre = ?, descripcion = ? WHERE categoria_id = ?',
        [nombre, descripcion || null, id]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return await this.getById(id);
    } catch (error) {
      console.error(`Error en update(${id}) de CategoricalModel:`, error);
      throw error;
    }
  },

  /**
   * Eliminar una categoría
   * @param {number} id - ID de la categoría a eliminar
   * @returns {Promise<boolean>} True si se eliminó, false si no
   */
  async delete(id) {
    try {
      // Verificar si la categoría existe antes de eliminar
      const categoria = await this.getById(id);
      if (!categoria) {
        return false;
      }
      
      const [result] = await db.query('DELETE FROM Categoria WHERE categoria_id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      // Manejar error de clave foránea si hay dispositivos asociados
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
        throw new Error('No se puede eliminar la categoría porque tiene dispositivos asociados');
      }
      console.error(`Error en delete(${id}) de CategoricalModel:`, error);
      throw error;
    }
  },

  /**
   * Buscar categorías por nombre
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise<Array>} Categorías que coinciden
   */
  async searchByName(searchTerm) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM Categoria WHERE nombre LIKE ? ORDER BY nombre',
        [`%${searchTerm}%`]
      );
      return rows;
    } catch (error) {
      console.error(`Error en searchByName(${searchTerm}) de CategoricalModel:`, error);
      throw error;
    }
  },

  /**
   * Obtener categorías con conteo de dispositivos
   * @returns {Promise<Array>} Categorías con cantidad de dispositivos
   */
  async getWithDeviceCount() {
    try {
      const [rows] = await db.query(`
        SELECT 
          c.categoria_id,
          c.nombre,
          c.descripcion,
          COUNT(d.dispositivo_id) as cantidad_dispositivos
        FROM Categoria c
        LEFT JOIN Dispositivo d ON c.categoria_id = d.categoria_id
        GROUP BY c.categoria_id, c.nombre, c.descripcion
        ORDER BY c.nombre
      `);
      return rows;
    } catch (error) {
      console.error('Error en getWithDeviceCount de CategoricalModel:', error);
      throw error;
    }
  }
};

module.exports = CategoricalModel;