// middlewares/auth.middleware.js
const { verifyToken } = require('../utils/jwt');

/**
 * Extrae el token del header de autorización o cookies
 * @param {Request} req
 * @returns {string|null}
 */
const getTokenFromRequest = (req) => {
  // Prioritar Bearer token en Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token.trim().length > 0) {
      return token;
    }
  }

  // Fallback a cookies si Authorization no está presente
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        acc[name] = decodeURIComponent(value);
      }
      return acc;
    }, {});
    return cookies.token || null;
  }

  return null;
};

/**
 * Middleware para validar JWT en rutas protegidas
 */
const authMiddleware = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado. Autenticación requerida.',
        status: 401
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    let message = 'Token inválido o expirado';
    let status = 401;

    if (error.name === 'TokenExpiredError') {
      message = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token inválido.';
      status = 400;
    }

    return res.status(status).json({
      success: false,
      message,
      status
    });
  }
};

/**
 * Middleware para validar que el usuario sea administrador
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticación requerida',
      status: 401
    });
  }

  if (req.user.rol_id === 1) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Acceso denegado: se requieren permisos de administrador',
    status: 403
  });
};

module.exports = { authMiddleware, isAdmin, getTokenFromRequest };