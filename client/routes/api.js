const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Proxy para las APIs del servidor
router.get('/dispositivos', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/dispositivos`, {
      params: req.query
    });
    res.json(response.data);
  } catch (error) {
    console.error('API Error - dispositivos:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Error del servidor'
    });
  }
});

router.get('/dispositivos/:id', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/dispositivos/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('API Error - dispositivo detail:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Error del servidor'
    });
  }
});

router.get('/categorias', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/categorias`);
    res.json(response.data);
  } catch (error) {
    console.error('API Error - categorias:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Error del servidor'
    });
  }
});

router.get('/marcas', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/marcas`);
    res.json(response.data);
  } catch (error) {
    console.error('API Error - marcas:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Error del servidor'
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    res.json(response.data);
  } catch (error) {
    console.error('API Health Check Error:', error);
    res.status(503).json({
      status: 'ERROR',
      message: 'No se puede conectar al servidor API',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;