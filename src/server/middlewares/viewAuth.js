// middlewares/viewAuth.js

/**
 * Middleware para verificar autenticación en rutas de páginas
 * Redirige al login si el usuario no está autenticado
 */
const authPages = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.user = {
      usuario_id: req.session.userId,
      rol_id: req.session.rolId,
      email: req.session.email
    };
    return next();
  }

  res.redirect('/login');
};

/**
 * Middleware para verificar autenticación de administrador
 * Redirige al login si no es administrador
 */
const adminPages = (req, res, next) => {
  if (req.session && req.session.userId && req.session.rolId === 1) {
    req.user = {
      usuario_id: req.session.userId,
      rol_id: req.session.rolId,
      email: req.session.email
    };
    return next();
  }

  res.status(403).render('error', {
    status: 403,
    message: 'Acceso denegado. Se requiere rol de administrador.'
  });
};

/**
 * Middleware para asignar datos de usuario a res.locals
 * Disponible en todas las vistas
 */
const setUserLocals = (req, res, next) => {
  if (req.session && req.session.userId) {
    res.locals.user = {
      id: req.session.userId,
      rol: req.session.rolId,
      email: req.session.email
    };
    
    // Establecer req.user para acceso en controladores
    req.user = {
      usuario_id: req.session.userId,
      rol_id: req.session.rolId,
      email: req.session.email
    };
  } else {
    res.locals.user = null;
    req.user = null;
  }

  next();
};

/**
 * Middleware para verificar autenticación en rutas API
 * Retorna error 401 si no está autenticado
 */
const apiAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.user = {
      usuario_id: req.session.userId,
      rol_id: req.session.rolId,
      email: req.session.email
    };
    return next();
  }

  throw new Error('Debe iniciar sesión para acceder a este recurso');
};

/**
 * Middleware para verificar autenticación de administrador en API
 */
const apiAdminAuth = (req, res, next) => {
  if (req.session && req.session.userId && req.session.rolId === 1) {
    req.user = {
      usuario_id: req.session.userId,
      rol_id: req.session.rolId,
      email: req.session.email
    };
    return next();
  }

  throw new Error('Se requiere rol de administrador para acceder a este recurso');
};

module.exports = {
  authPages,
  adminPages,
  setUserLocals,
  apiAuth,
  apiAdminAuth
};