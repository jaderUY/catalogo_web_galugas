import express from 'express';
import apiClient from '../services/APIClient.js';

const router = express.Router();

/**
 * GET - Obtiene dispositivos (proxy)
 */
router.get('/dispositivos', async (req, res) => {
  try {
    const response = await apiClient.getDispositivos(req.query);
    res.json(response.data);
  } catch (error) {
    console.error('API Error - dispositivos:', error.message);
    res.status(error.status || 500).json({
      error: error.message,
      isNetworkError: error.isNetworkError
    });
  }
});

/**
 * GET - Obtiene un dispositivo por ID (proxy)
 */
router.get('/dispositivos/:id', async (req, res) => {
  try {
    const response = await apiClient.getDispositivoById(req.params.id);
    res.json(response.data);
  } catch (error) {
    console.error('API Error - dispositivo detail:', error.message);
    res.status(error.status || 500).json({
      error: error.message,
      isNetworkError: error.isNetworkError
    });
  }
});

/**
 * GET - Obtiene categorías (proxy)
 */
router.get('/categorias', async (req, res) => {
  try {
    const response = await apiClient.getCategorias();
    res.json(response.data);
  } catch (error) {
    console.error('API Error - categorias:', error.message);
    res.status(error.status || 500).json({
      error: error.message,
      isNetworkError: error.isNetworkError
    });
  }
});

/**
 * GET - Obtiene marcas (proxy)
 */
router.get('/marcas', async (req, res) => {
  try {
    const response = await apiClient.getMarcas();
    res.json(response.data);
  } catch (error) {
    console.error('API Error - marcas:', error.message);
    res.status(error.status || 500).json({
      error: error.message,
      isNetworkError: error.isNetworkError
    });
  }
});

/**
 * GET - Health check de la API
 */
router.get('/health', async (req, res) => {
  try {
    const response = await apiClient.healthCheck();
    res.json(response.data);
  } catch (error) {
    console.error('API Health Check Error:', error.message);
    res.status(503).json({
      status: 'ERROR',
      message: 'No se puede conectar al servidor API',
      timestamp: new Date().toISOString(),
      isNetworkError: error.isNetworkError
    });
  }
});

export default router;