import express from 'express';
import authRoutes from './auth.js';
import dispositivoRoutes from './dispositivos.js';
import logRoutes from './logs.js';
import categoriaRoutes from './categorias.js';
import marcaRoutes from './marcas.js';
import usuarioRoutes from './usuarios.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Montar rutas
router.use('/auth', authRoutes);
router.use('/dispositivos', dispositivoRoutes);
router.use('/logs', logRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/marcas', marcaRoutes);
router.use('/usuarios', usuarioRoutes);

// Ruta por defecto para API
router.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de Galugas',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      dispositivos: '/api/dispositivos',
      categorias: '/api/categorias',
      marcas: '/api/marcas',
      logs: '/api/logs',
      usuarios: '/api/usuarios'
    }
  });
});

export default router;