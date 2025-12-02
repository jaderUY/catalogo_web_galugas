import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Clase para logging avanzado del sistema
 */
export class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this._ensureLogDirExists();
  }

  /**
   * Crea el directorio de logs si no existe
   * @private
   */
  _ensureLogDirExists() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Escribe un mensaje en el archivo de log
   * @param {string} level - Nivel del log
   * @param {string} message - Mensaje a loggear
   * @param {Object} meta - Metadatos adicionales
   * @private
   */
  _writeToFile(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };

    const logFile = path.join(this.logDir, `${timestamp.split('T')[0]}.log`);
    const logLine = JSON.stringify(logEntry) + '\n';

    fs.appendFileSync(logFile, logLine, 'utf8');
  }

  /**
   * Log de nivel info
   * @param {string} message - Mensaje
   * @param {Object} meta - Metadatos
   */
  info(message, meta = {}) {
    console.log(`ℹ️ INFO: ${message}`, meta);
    this._writeToFile('INFO', message, meta);
  }

  /**
   * Log de nivel warn
   * @param {string} message - Mensaje
   * @param {Object} meta - Metadatos
   */
  warn(message, meta = {}) {
    console.warn(`WARN: ${message}`, meta);
    this._writeToFile('WARN', message, meta);
  }

  /**
   * Log de nivel error
   * @param {string} message - Mensaje
   * @param {Object} meta - Metadatos
   */
  error(message, meta = {}) {
    console.error(`ERROR: ${message}`, meta);
    this._writeToFile('ERROR', message, meta);
  }

  /**
   * Log de nivel debug
   * @param {string} message - Mensaje
   * @param {Object} meta - Metadatos
   */
  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`🐛 DEBUG: ${message}`, meta);
      this._writeToFile('DEBUG', message, meta);
    }
  }

  /**
   * Log de una operación del sistema
   * @param {string} operation - Operación realizada
   * @param {Object} details - Detalles de la operación
   */
  system(operation, details = {}) {
    this.info(`Sistema: ${operation}`, details);
  }

  /**
   * Log de una operación de la base de datos
   * @param {string} query - Consulta ejecutada
   * @param {number} duration - Duración en ms
   * @param {Object} meta - Metadatos adicionales
   */
  database(query, duration, meta = {}) {
    this.debug(`Consulta DB: ${query}`, { duration, ...meta });
  }

  /**
   * Log de una operación de API
   * @param {string} method - Método HTTP
   * @param {string} endpoint - Endpoint
   * @param {number} statusCode - Código de estado
   * @param {number} duration - Duración en ms
   * @param {Object} meta - Metadatos adicionales
   */
  api(method, endpoint, statusCode, duration, meta = {}) {
    const level = statusCode >= 400 ? 'WARN' : 'INFO';
    this[level.toLowerCase()](`API ${method} ${endpoint}`, { 
      statusCode, 
      duration, 
      ...meta 
    });
  }
}

// Singleton para el logger
const logger = new Logger();
export default logger;