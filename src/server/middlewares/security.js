// middlewares/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss');
const env = require('../config/env');

// Helmet: Protección de headers HTTP
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: 'deny' }
});

// Rate Limiting para API
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development'
});

// Rate Limiting más estricto para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5, // 5 intentos
  message: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware para sanitizar input XSS
const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key], {
          whiteList: {},
          stripIgnoredTag: true,
          stripLeadingAndTrailingWhitespace: true
        });
      }
    });
  }
  next();
};

module.exports = {
  helmetConfig,
  apiLimiter,
  authLimiter,
  sanitizeInput
};
