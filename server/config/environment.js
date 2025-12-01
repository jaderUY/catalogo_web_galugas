import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  // Servidor
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  CLIENT_PORT: process.env.CLIENT_PORT || 3001,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3001',

  // Base de datos
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'DB_Galugas_web',

  // Seguridad
  SESSION_SECRET: process.env.SESSION_SECRET || 'galugas-super-secret-key-change-in-production',
  JWT_SECRET: process.env.JWT_SECRET || 'jwt-super-secret-key',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,

  // Uploads
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || path.join(__dirname, '../uploads'),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_RETENTION_DAYS: parseInt(process.env.LOG_RETENTION_DAYS) || 90,

  // API
  API_VERSION: process.env.API_VERSION || 'v1',
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutos
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100 // 100 requests por ventana
};

// Validar configuraciones requeridas
export const validateConfig = () => {
  const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'SESSION_SECRET'];
  const missing = required.filter(key => !process.env[key] && !config[key]);

  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno requeridas: ${missing.join(', ')}`);
  }

  console.log('✅ Configuración del entorno validada');
};

export default config;