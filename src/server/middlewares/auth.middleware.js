// middlewares/auth.middleware.js
const { verifyToken } = require('../utils/jwt');

const parseCookies = (cookieHeader = '') => {
  return cookieHeader.split(';').reduce((cookies, cookiePair) => {
    const [name, ...value] = cookiePair.trim().split('=');
    if (!name) return cookies;
    cookies[name] = decodeURIComponent(value.join('='));
    return cookies;
  }, {});
};

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  const cookies = parseCookies(req.headers.cookie || '');
  return cookies.token;
};

const authMiddleware = (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.rol_id === 1) {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado: se requieren permisos de administrador' });
  }
};

module.exports = { authMiddleware, isAdmin, getTokenFromRequest };