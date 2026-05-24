// config/env.js
require('dotenv').config();

const requiredEnvVars = ['SESSION_SECRET', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ VARIABLES DE ENTORNO REQUERIDAS FALTANDO: ${missingVars.join(', ')}`);
  console.error('Por favor configura estas variables en tu archivo .env');
  process.exit(1);
}

const env = {
  PORT: parseInt(process.env.PORT || 3000, 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  SESSION_SECRET: process.env.SESSION_SECRET,
  SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE, 10) || 1000 * 60 * 60 * 24 * 7,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'db_galugas_web',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 min
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
};

// Validar que el PORT sea un número válido
if (isNaN(env.PORT) || env.PORT < 1 || env.PORT > 65535) {
  throw new Error('PORT debe ser un número entre 1 y 65535');
}

module.exports = env;