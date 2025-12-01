const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// API endpoints para el cliente (AJAX)
router.get('/api/categorias', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/categorias`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching categorias:', error);
    res.status(500).json({ error: 'Error al cargar las categorías' });
  }
});

router.get('/api/marcas', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/marcas`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching marcas:', error);
    res.status(500).json({ error: 'Error al cargar las marcas' });
  }
});

router.get('/api/dispositivos-filters', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/dispositivos`, {
      params: req.query
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching dispositivos with filters:', error);
    res.status(500).json({ error: 'Error al cargar los dispositivos' });
  }
});

module.exports = router;