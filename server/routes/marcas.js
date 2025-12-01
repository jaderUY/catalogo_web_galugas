import express from 'express';
import MarcaController from '../controllers/MarcaController.js';
import AuthMiddleware from '../middleware/AuthMiddleware.js';
import { asyncHandler } from '../utils/ErrorHandler.js';

const router = express.Router();
const marcaController = new MarcaController();

// Rutas públicas
router.get('/', asyncHandler(marcaController.getMarcas));
router.get('/:id', asyncHandler(marcaController.getMarcaById));

// Rutas protegidas - Requieren autenticación
router.use(AuthMiddleware.requireAuth);
router.use(AuthMiddleware.requireAdmin);

router.post('/', asyncHandler(marcaController.createMarca));
router.put('/:id', asyncHandler(marcaController.updateMarca));
router.delete('/:id', asyncHandler(marcaController.deleteMarca));

export default router;