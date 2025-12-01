import express from 'express';
import CategoriaController from '../controllers/CategoriaController.js';
import AuthMiddleware from '../middleware/AuthMiddleware.js';
import { asyncHandler } from '../utils/ErrorHandler.js';

const router = express.Router();
const categoriaController = new CategoriaController();

// Rutas públicas
router.get('/', asyncHandler(categoriaController.getCategorias));
router.get('/:id', asyncHandler(categoriaController.getCategoriaById));

// Rutas protegidas - Requieren autenticación
router.use(AuthMiddleware.requireAuth);
router.use(AuthMiddleware.requireAdmin);

router.post('/', asyncHandler(categoriaController.createCategoria));
router.put('/:id', asyncHandler(categoriaController.updateCategoria));
router.delete('/:id', asyncHandler(categoriaController.deleteCategoria));

export default router;