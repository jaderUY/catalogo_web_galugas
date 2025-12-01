import express from 'express';
import DispositivoController from '../controllers/DispositivoController.js';
import AuthMiddleware from '../middleware/AuthMiddleware.js';
import { uploadSingle, handleUploadErrors } from '../middleware/UploadMiddleware.js';
import { asyncHandler } from '../utils/ErrorHandler.js';

const router = express.Router();
const dispositivoController = new DispositivoController();

// Rutas públicas
router.get('/', asyncHandler(dispositivoController.getDispositivos));
router.get('/search', asyncHandler(dispositivoController.searchDispositivos));
router.get('/estadisticas', asyncHandler(dispositivoController.getEstadisticas));
router.get('/:id', asyncHandler(dispositivoController.getDispositivoById));

// Rutas protegidas - Requieren autenticación
router.use(AuthMiddleware.requireAuth);

// Rutas de administración - Requieren ser vendedor o admin
router.use(AuthMiddleware.requireVendedor);

router.post(
  '/', 
  uploadSingle,
  handleUploadErrors,
  asyncHandler(dispositivoController.createDispositivo)
);

router.put(
  '/:id',
  uploadSingle,
  handleUploadErrors, 
  asyncHandler(dispositivoController.updateDispositivo)
);

// Rutas de eliminación - Solo administradores
router.delete(
  '/:id',
  AuthMiddleware.requireAdmin,
  asyncHandler(dispositivoController.deleteDispositivo)
);

export default router;