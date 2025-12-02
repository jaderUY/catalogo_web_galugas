import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde la raíz del proyecto
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  // Servidor
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.SERVER_PORT || '3000', 10),
  CLIENT_PORT: parseInt(process.env.CLIENT_PORT || '3001', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3001',

  // Base de datos
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'DB_Galugas_web',
  DB_POOL_LIMIT: parseInt(process.env.DB_POOL_LIMIT || '10', 10),
  DB_CONNECTION_TIMEOUT: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10),

  // Seguridad
  SESSION_SECRET: process.env.SERVER_SESSION_SECRET || 'galugas-server-session-secret-change-in-production',
  JWT_SECRET: process.env.JWT_SECRET || 'galugas-jwt-secret-change-in-production',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  // Uploads
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || path.join(__dirname, '../uploads'),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_RETENTION_DAYS: parseInt(process.env.LOG_RETENTION_DAYS || '90', 10),

  // API
  API_VERSION: process.env.API_VERSION || 'v1',
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutos
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests por ventana

  // Debugging
  DEBUG: process.env.DEBUG === 'true',
  DEBUG_SQL: process.env.DEBUG_SQL === 'true',
  VERBOSE_LOGGING: process.env.VERBOSE_LOGGING === 'true'
};

/**
 * Valida la configuración requerida
 */
export const validateConfig = () => {
  const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'SESSION_SECRET'];
  const missing = required.filter(key => !process.env[key] && !config[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (config.NODE_ENV === 'production') {
    const productionRequired = ['JWT_SECRET'];
    const missingProd = productionRequired.filter(key => {
      const val = process.env[key];
      return !val || val.includes('change-in-production');
    });
    
    if (missingProd.length > 0) {
      throw new Error(`Production environment requires proper values for: ${missingProd.join(', ')}`);
    }
  }

  console.log('Server configuration validated successfully');
};

export default config;
