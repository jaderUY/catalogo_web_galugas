const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const axios = require('axios');

const app = express();

// Configuración
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'galugas-client-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));
app.use(flash());

// Variables globales para las vistas
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  res.locals.isAdmin = req.session.user && req.session.user.rol_nombre === 'Administrador';
  res.locals.isVendedor = req.session.user && (
    req.session.user.rol_nombre === 'Vendedor' || 
    req.session.user.rol_nombre === 'Administrador'
  );
  res.locals.API_URL = process.env.API_URL || 'http://localhost:3000/api';
  next();
});

// Rutas
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/dispositivos', require('./routes/dispositivos'));
app.use('/api', require('./routes/api'));

// Manejo de errores
app.use((req, res) => {
  res.status(404).render('error/404', { 
    title: 'Página No Encontrada - Galugas',
    user: req.session.user 
  });
});

app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  res.status(500).render('error/500', { 
    title: 'Error del Servidor - Galugas',
    user: req.session.user 
  });
});

const PORT = process.env.CLIENT_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎨 Cliente Galugas corriendo en http://localhost:${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: ${process.env.API_URL || 'http://localhost:3000/api'}`);
});

module.exports = app;