import mysql from 'mysql2/promise';
import { config } from './environment.js';

/**
 * Clase para gestión de conexiones a la base de datos
 */
class Database {
  constructor() {
    this.pool = null;
    this.config = {
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      charset: 'utf8mb4',
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    };
  }

  /**
   * Inicializa el pool de conexiones
   */
  async initialize() {
    try {
      this.pool = mysql.createPool(this.config);
      
      // Probar la conexión
      const connection = await this.pool.getConnection();
      console.log('✅ Conexión a la base de datos establecida');
      connection.release();
      
      return this.pool;
    } catch (error) {
      console.error('❌ Error conectando a la base de datos:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene una conexión del pool
   * @returns {Promise} Conexión a la base de datos
   */
  async getConnection() {
    if (!this.pool) {
      await this.initialize();
    }
    return await this.pool.getConnection();
  }

  /**
   * Ejecuta una consulta SQL
   * @param {string} query - Consulta SQL
   * @param {Array} params - Parámetros
   * @returns {Promise} Resultado de la consulta
   */
  async execute(query, params = []) {
    let connection;
    try {
      connection = await this.getConnection();
      const [results] = await connection.execute(query, params);
      return results;
    } catch (error) {
      console.error('Error en consulta SQL:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Inicia una transacción
   * @returns {Promise} Objeto con commit y rollback
   */
  async beginTransaction() {
    const connection = await this.getConnection();
    await connection.beginTransaction();
    
    return {
      connection,
      commit: async () => {
        try {
          await connection.commit();
          connection.release();
        } catch (error) {
          await connection.rollback();
          connection.release();
          throw error;
        }
      },
      rollback: async () => {
        try {
          await connection.rollback();
          connection.release();
        } catch (error) {
          connection.release();
          throw error;
        }
      },
      execute: (query, params = []) => connection.execute(query, params)
    };
  }

  /**
   * Cierra el pool de conexiones
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('🔌 Pool de conexiones cerrado');
    }
  }
}

// Singleton para la base de datos
const database = new Database();
export default database;