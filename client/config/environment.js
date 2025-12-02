import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cargar variables de entorno desde la raíz del proyecto
dotenv.config({ 
  path: path.join(__dirname, '../../.env') 
});

/**
 * Configuración centralizada del cliente
 */
export const config = {
  // Entorno
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Puerto
  PORT: parseInt(process.env.CLIENT_PORT || '3001', 10),
  
  // Sesión
  SESSION_SECRET: process.env.CLIENT_SESSION_SECRET || 'galugas-client-session-secret-change-in-production',
  SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10),
  SESSION_COOKIE_SECURE: process.env.SESSION_COOKIE_SECURE === 'true',
  
  // API
  API_URL: process.env.API_URL || 'http://localhost:3000/api',
  API_TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000', 10),
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:3000',
  
  // Archivos
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
  UPLOAD_PATH: process.env.CLIENT_UPLOAD_PATH || './client/public/uploads',
  
  // Seguridad
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  DEBUG: process.env.DEBUG === 'true',
  
  // Valores por defecto
  DEFAULT_PAGINATION_LIMIT: 12,
  DEFAULT_ITEMS_PER_PAGE: 20
};

/**
 * Valida la configuración del entorno
 */
export const validateConfig = () => {
  const required = [
    'SESSION_SECRET',
    'API_URL'
  ];

  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    console.warn('WARNING: Missing environment variables:', missing.join(', '));
  }

  if (config.IS_PRODUCTION && config.SESSION_SECRET === 'galugas-client-session-secret-change-in-production') {
    console.error('CRITICAL ERROR: SESSION_SECRET must not be the default value in production');
    process.exit(1);
  }

  if (config.API_URL.includes('localhost') && config.IS_PRODUCTION) {
    console.warn('WARNING: API_URL points to localhost in production. This may cause issues.');
  }

  console.log('Client configuration validated successfully');
};

export default config;

