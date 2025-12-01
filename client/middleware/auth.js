// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    req.session.returnTo = req.originalUrl;
    req.flash('error_msg', 'Por favor inicia sesión para acceder a esta página');
    return res.redirect('/auth/login');
  }
  next();
};

// Middleware para verificar rol de administrador
const requireAdmin = async (req, res, next) => {
  if (!req.session.user) {
    req.session.returnTo = req.originalUrl;
    req.flash('error_msg', 'Por favor inicia sesión');
    return res.redirect('/auth/login');
  }

  if (req.session.user.rol_nombre !== 'Administrador') {
    req.flash('error_msg', 'No tienes permisos para acceder a esta página');
    return res.redirect('/');
  }

  next();
};

// Middleware para verificar rol de vendedor o admin
const requireVendedor = async (req, res, next) => {
  if (!req.session.user) {
    req.session.returnTo = req.originalUrl;
    req.flash('error_msg', 'Por favor inicia sesión');
    return res.redirect('/auth/login');
  }

  if (!['Administrador', 'Vendedor'].includes(req.session.user.rol_nombre)) {
    req.flash('error_msg', 'No tienes permisos para acceder a esta página');
    return res.redirect('/');
  }

  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireVendedor
};