import express from 'express';
import UserController from '../controllers/UserController.js';
import AuthMiddleware from '../middleware/AuthMiddleware.js';
import { asyncHandler } from '../utils/ErrorHandler.js';

const router = express.Router();
const userController = new UserController();

// Todas las rutas requieren autenticación
router.use(AuthMiddleware.requireAuth);

// Rutas para administradores
router.use(AuthMiddleware.requireAdmin);

router.get('/', asyncHandler(userController.getUsuarios));
router.get('/:id', asyncHandler(userController.getUsuarioById));
router.put('/:id', asyncHandler(userController.updateUsuario));
router.delete('/:id', asyncHandler(userController.deleteUsuario));
router.put('/:id/role', asyncHandler(userController.updateUserRole));
router.put('/:id/status', asyncHandler(userController.updateUserStatus));

export default router;