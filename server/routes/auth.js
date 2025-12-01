import express from 'express';
import AuthController from '../controllers/AuthController.js';
import AuthMiddleware from '../middleware/AuthMiddleware.js';
import { asyncHandler } from '../utils/ErrorHandler.js';

const router = express.Router();
const authController = new AuthController();

// Rutas públicas
router.post('/login', asyncHandler(authController.login));
router.post('/register', asyncHandler(authController.register));
router.post('/logout', asyncHandler(authController.logout));

// Rutas protegidas - Requieren autenticación
router.use(AuthMiddleware.requireAuth);

router.get('/me', asyncHandler(authController.getCurrentUser));
router.get('/check-admin', asyncHandler(authController.checkAdmin));
router.put('/profile', asyncHandler(authController.updateProfile));
router.put('/change-password', asyncHandler(authController.changePassword));

export default router;