import express from 'express';
import LogController from '../controllers/LogController.js';
import AuthMiddleware from '../middleware/AuthMiddleware.js';
import { asyncHandler } from '../utils/ErrorHandler.js';

const router = express.Router();
const logController = new LogController();

// Todas las rutas requieren autenticación
router.use(AuthMiddleware.requireAuth);

// Rutas accesibles para todos los usuarios autenticados
router.get('/mis-actividades', asyncHandler(logController.obtenerMisActividades));

// Rutas solo para administradores
router.use(AuthMiddleware.requireAdmin);

router.get('/', asyncHandler(logController.obtenerLogs));
router.get('/estadisticas', asyncHandler(logController.obtenerEstadisticas));
router.get('/exportar', asyncHandler(logController.exportarLogs));
router.post('/limpiar', asyncHandler(logController.limpiarLogsAntiguos));

export default router;