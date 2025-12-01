const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Configuración de multer para uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes.'), false);
    }
  }
});

// Middleware para verificar autenticación y rol de administrador
const requireAdmin = async (req, res, next) => {
  if (!req.session.user) {
    req.flash('error_msg', 'Por favor inicia sesión para acceder al panel de administración');
    return res.redirect('/auth/login');
  }
  
  try {
    const response = await axios.get(`${API_URL}/auth/check-admin`, {
      headers: {
        'Cookie': `connect.sid=${req.sessionID}`
      }
    });
    
    if (!response.data.isAdmin) {
      req.flash('error_msg', 'No tienes permisos para acceder a esta página');
      return res.redirect('/');
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    req.flash('error_msg', 'Error al verificar permisos de administrador');
    res.redirect('/');
  }
};

// Dashboard de administración
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [dispositivosResponse, logsResponse, usuariosResponse, estadisticasResponse] = await Promise.all([
      axios.get(`${API_URL}/dispositivos`, { params: { limit: 5 } }),
      axios.get(`${API_URL}/logs/estadisticas`),
      axios.get(`${API_URL}/usuarios`),
      axios.get(`${API_URL}/dispositivos/estadisticas`)
    ]);

    res.render('admin/dashboard', {
      title: 'Dashboard - Panel de Administración',
      dispositivos: dispositivosResponse.data.data,
      logs: logsResponse.data.data,
      usuarios: usuariosResponse.data.data,
      estadisticas: estadisticasResponse.data.data,
      activePage: 'dashboard'
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    req.flash('error_msg', 'Error al cargar el dashboard');
    res.render('admin/dashboard', {
      title: 'Dashboard - Panel de Administración',
      dispositivos: [],
      logs: {},
      usuarios: [],
      estadisticas: {},
      activePage: 'dashboard'
    });
  }
});

// Gestión de dispositivos - Lista
router.get('/dispositivos', requireAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/dispositivos`, {
      params: { ...req.query, limit: 50 }
    });

    const [categoriasResponse, marcasResponse] = await Promise.all([
      axios.get(`${API_URL}/categorias`),
      axios.get(`${API_URL}/marcas`)
    ]);

    res.render('admin/dispositivos/list', {
      title: 'Gestión de Dispositivos',
      dispositivos: response.data.data,
      categorias: categoriasResponse.data.data,
      marcas: marcasResponse.data.data,
      filters: req.query,
      activePage: 'dispositivos'
    });
  } catch (error) {
    console.error('Error loading dispositivos:', error);
    req.flash('error_msg', 'Error al cargar los dispositivos');
    res.render('admin/dispositivos/list', {
      title: 'Gestión de Dispositivos',
      dispositivos: [],
      categorias: [],
      marcas: [],
      filters: {},
      activePage: 'dispositivos'
    });
  }
});

// Formulario para crear dispositivo
router.get('/dispositivos/crear', requireAdmin, async (req, res) => {
  try {
    const [categoriasResponse, marcasResponse, infoTecnicaResponse] = await Promise.all([
      axios.get(`${API_URL}/categorias`),
      axios.get(`${API_URL}/marcas`),
      axios.get(`${API_URL}/informacion-tecnica`)
    ]);

    res.render('admin/dispositivos/create', {
      title: 'Crear Dispositivo',
      categorias: categoriasResponse.data.data,
      marcas: marcasResponse.data.data,
      infoTecnica: infoTecnicaResponse.data.data,
      activePage: 'dispositivos'
    });
  } catch (error) {
    console.error('Error loading create form:', error);
    req.flash('error_msg', 'Error al cargar el formulario');
    res.redirect('/admin/dispositivos');
  }
});

// Procesar creación de dispositivo
router.post('/dispositivos/crear', requireAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const formData = new FormData();
    
    // Agregar campos del formulario
    Object.keys(req.body).forEach(key => {
      formData.append(key, req.body[key]);
    });

    // Agregar archivo si existe
    if (req.file) {
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
      formData.append('imagen', blob, req.file.originalname);
    }

    await axios.post(`${API_URL}/dispositivos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Cookie': `connect.sid=${req.sessionID}`
      }
    });

    req.flash('success_msg', 'Dispositivo creado exitosamente');
    res.redirect('/admin/dispositivos');
  } catch (error) {
    console.error('Error creating dispositivo:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.error || 
                        'Error al crear el dispositivo';
    
    req.flash('error_msg', errorMessage);
    res.redirect('/admin/dispositivos/crear');
  }
});

// Formulario para editar dispositivo
router.get('/dispositivos/editar/:id', requireAdmin, async (req, res) => {
  try {
    const [dispositivoResponse, categoriasResponse, marcasResponse, infoTecnicaResponse] = await Promise.all([
      axios.get(`${API_URL}/dispositivos/${req.params.id}`),
      axios.get(`${API_URL}/categorias`),
      axios.get(`${API_URL}/marcas`),
      axios.get(`${API_URL}/informacion-tecnica`)
    ]);

    res.render('admin/dispositivos/edit', {
      title: 'Editar Dispositivo',
      dispositivo: dispositivoResponse.data.data,
      categorias: categoriasResponse.data.data,
      marcas: marcasResponse.data.data,
      infoTecnica: infoTecnicaResponse.data.data,
      activePage: 'dispositivos'
    });
  } catch (error) {
    console.error('Error loading edit form:', error);
    req.flash('error_msg', 'Error al cargar el formulario de edición');
    res.redirect('/admin/dispositivos');
  }
});

// Procesar actualización de dispositivo
router.post('/dispositivos/editar/:id', requireAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const formData = new FormData();
    
    // Agregar campos del formulario
    Object.keys(req.body).forEach(key => {
      formData.append(key, req.body[key]);
    });

    // Agregar archivo si existe
    if (req.file) {
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
      formData.append('imagen', blob, req.file.originalname);
    }

    await axios.put(`${API_URL}/dispositivos/${req.params.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Cookie': `connect.sid=${req.sessionID}`
      }
    });

    req.flash('success_msg', 'Dispositivo actualizado exitosamente');
    res.redirect('/admin/dispositivos');
  } catch (error) {
    console.error('Error updating dispositivo:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.error || 
                        'Error al actualizar el dispositivo';
    
    req.flash('error_msg', errorMessage);
    res.redirect(`/admin/dispositivos/editar/${req.params.id}`);
  }
});

// Eliminar dispositivo
router.post('/dispositivos/eliminar/:id', requireAdmin, async (req, res) => {
  try {
    await axios.delete(`${API_URL}/dispositivos/${req.params.id}`, {
      headers: {
        'Cookie': `connect.sid=${req.sessionID}`
      }
    });

    req.flash('success_msg', 'Dispositivo eliminado exitosamente');
  } catch (error) {
    console.error('Error deleting dispositivo:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.error || 
                        'Error al eliminar el dispositivo';
    
    req.flash('error_msg', errorMessage);
  }
  
  res.redirect('/admin/dispositivos');
});

// Gestión de logs
router.get('/logs', requireAdmin, async (req, res) => {
  try {
    const [logsResponse, estadisticasResponse] = await Promise.all([
      axios.get(`${API_URL}/logs`, { params: req.query }),
      axios.get(`${API_URL}/logs/estadisticas`)
    ]);

    res.render('admin/logs/list', {
      title: 'Sistema de Logs',
      logs: logsResponse.data.data,
      paginacion: logsResponse.data.paginacion,
      estadisticas: estadisticasResponse.data.data,
      filters: req.query,
      activePage: 'logs'
    });
  } catch (error) {
    console.error('Error loading logs:', error);
    req.flash('error_msg', 'Error al cargar los logs');
    res.render('admin/logs/list', {
      title: 'Sistema de Logs',
      logs: [],
      paginacion: {},
      estadisticas: {},
      filters: {},
      activePage: 'logs'
    });
  }
});

// Exportar logs
router.get('/logs/exportar', requireAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/logs/exportar`, {
      params: req.query,
      responseType: 'stream'
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=logs_galugas_${new Date().toISOString().split('T')[0]}.csv`);
    
    response.data.pipe(res);
  } catch (error) {
    console.error('Error exporting logs:', error);
    req.flash('error_msg', 'Error al exportar los logs');
    res.redirect('/admin/logs');
  }
});

// Gestión de usuarios
router.get('/usuarios', requireAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/usuarios`, {
      params: req.query
    });

    res.render('admin/usuarios/list', {
      title: 'Gestión de Usuarios',
      usuarios: response.data.data,
      filters: req.query,
      activePage: 'usuarios'
    });
  } catch (error) {
    console.error('Error loading usuarios:', error);
    req.flash('error_msg', 'Error al cargar los usuarios');
    res.render('admin/usuarios/list', {
      title: 'Gestión de Usuarios',
      usuarios: [],
      filters: {},
      activePage: 'usuarios'
    });
  }
});

// Perfil de administrador
router.get('/profile', requireAdmin, (req, res) => {
  res.render('admin/profile', {
    title: 'Mi Perfil - Administración',
    activePage: 'profile'
  });
});

module.exports = router;