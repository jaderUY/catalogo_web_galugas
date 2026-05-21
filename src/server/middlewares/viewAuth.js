// middlewares/viewAuth.js
const { verifyToken } = require('../utils/jwt');

const parseCookies = (cookieHeader = '') => {
  return cookieHeader.split(';').reduce((cookies, cookiePair) => {
    const [name, ...value] = cookiePair.trim().split('=');
    if (!name) return cookies;
    cookies[name] = decodeURIComponent(value.join('='));
    return cookies;
  }, {});
};

const getUserFromToken = (req) => {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies.token;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
};

module.exports = {
  authPages: (req, res, next) => {
    if (req.session && req.session.userId) {
      return next();
    }
    const user = getUserFromToken(req);
    if (user) {
      req.user = user;
      return next();
    }
    res.redirect('/login');
  },

  adminPages: (req, res, next) => {
    if (req.session && req.session.rolId === 1) {
      return next();
    }
    const user = getUserFromToken(req);
    if (user && user.rol_id === 1) {
      req.user = user;
      return next();
    }
    res.status(403).send('Acceso denegado. Se requiere rol de administrador.');
  },

  setUserLocals: (req, res, next) => {
    if (req.session && req.session.userId) {
      res.locals.user = { id: req.session.userId, rol: req.session.rolId };
      return next();
    }
    const user = getUserFromToken(req);
    res.locals.user = user ? { id: user.usuario_id, rol: user.rol_id, email: user.email } : null;
    if (user && !req.user) {
      req.user = user;
    }
    next();
  }
};