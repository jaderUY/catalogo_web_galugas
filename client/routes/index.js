const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Página de inicio
router.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/dispositivos`, {
      params: { 
        limit: 8, 
        orderBy: 'fechaLanzamiento', 
        orderDirection: 'DESC' 
      }
    });
    
    res.render('pages/home', {
      title: 'Inicio - Galugas | Tu Tienda de Tecnología',
      dispositivos: response.data.data,
      meta: {
        description: 'Descubre los últimos dispositivos tecnológicos en Galugas. Smartphones, tablets, accesorios y más al mejor precio.',
        keywords: 'tecnología, smartphones, tablets, accesorios, galugas'
      }
    });
  } catch (error) {
    console.error('Error fetching dispositivos:', error);
    res.render('pages/home', {
      title: 'Inicio - Galugas | Tu Tienda de Tecnología',
      dispositivos: [],
      meta: {
        description: 'Descubre los últimos dispositivos tecnológicos en Galugas.',
        keywords: 'tecnología, smartphones, tablets, accesorios, galugas'
      }
    });
  }
});

// Catálogo de productos
router.get('/catalogo', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/dispositivos`, {
      params: { ...req.query, limit: 12 }
    });
    
    // Obtener categorías y marcas para los filtros
    const [categoriasResponse, marcasResponse] = await Promise.all([
      axios.get(`${API_URL}/categorias`),
      axios.get(`${API_URL}/marcas`)
    ]);

    res.render('pages/catalog', {
      title: 'Catálogo de Productos - Galugas',
      dispositivos: response.data.data,
      categorias: categoriasResponse.data.data,
      marcas: marcasResponse.data.data,
      filters: req.query,
      meta: {
        description: 'Explora nuestro catálogo completo de dispositivos tecnológicos. Filtra por categoría, marca y precio.',
        keywords: 'catálogo, productos, smartphones, tablets, tecnología, comprar'
      }
    });
  } catch (error) {
    console.error('Error fetching catalogo:', error);
    res.render('pages/catalog', {
      title: 'Catálogo de Productos - Galugas',
      dispositivos: [],
      categorias: [],
      marcas: [],
      filters: {},
      meta: {
        description: 'Explora nuestro catálogo completo de dispositivos tecnológicos.',
        keywords: 'catálogo, productos, tecnología'
      }
    });
  }
});

// Detalle de producto
router.get('/producto/:id', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/dispositivos/${req.params.id}`);
    const dispositivo = response.data.data;
    
    res.render('pages/product-detail', {
      title: `${dispositivo.nombre} - Galugas`,
      dispositivo: dispositivo,
      meta: {
        description: dispositivo.descripcion || `Descubre ${dispositivo.nombre} de ${dispositivo.marca_nombre}. ${dispositivo.precio ? `Precio: $${dispositivo.precio}` : ''}`,
        keywords: `${dispositivo.nombre}, ${dispositivo.marca_nombre}, ${dispositivo.categoria_nombre}, tecnología, comprar`,
        image: dispositivo.imagen_url
      }
    });
  } catch (error) {
    console.error('Error fetching producto:', error);
    req.flash('error_msg', 'Producto no encontrado');
    res.redirect('/catalogo');
  }
});

// Página acerca de
router.get('/about', (req, res) => {
  res.render('pages/about', {
    title: 'Acerca de Nosotros - Galugas',
    meta: {
      description: 'Conoce más sobre Galugas, tu tienda de confianza para dispositivos tecnológicos. Calidad, garantía y el mejor servicio.',
      keywords: 'acerca de, nosotros, historia, galugas, tecnología'
    }
  });
});

// Página de contacto
router.get('/contact', (req, res) => {
  res.render('pages/contact', {
    title: 'Contacto - Galugas',
    meta: {
      description: 'Contáctanos para consultas, soporte técnico o información sobre nuestros productos. Estamos aquí para ayudarte.',
      keywords: 'contacto, soporte, ayuda, consultas, galugas'
    }
  });
});

// Procesar formulario de contacto
router.post('/contact', async (req, res) => {
  try {
    const { nombre, email, asunto, mensaje } = req.body;
    
    // Aquí podrías integrar con un servicio de email como Nodemailer
    console.log('Nuevo mensaje de contacto:', { nombre, email, asunto, mensaje });
    
    req.flash('success_msg', '¡Mensaje enviado correctamente! Te contactaremos pronto.');
    res.redirect('/contact');
  } catch (error) {
    console.error('Error procesando contacto:', error);
    req.flash('error_msg', 'Error al enviar el mensaje. Por favor intenta nuevamente.');
    res.redirect('/contact');
  }
});

// Búsqueda de productos
router.get('/buscar', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.redirect('/catalogo');
    }

    const response = await axios.get(`${API_URL}/dispositivos`, {
      params: { search: q.trim(), limit: 20 }
    });

    res.render('pages/catalog', {
      title: `Resultados para: "${q}" - Galugas`,
      dispositivos: response.data.data,
      searchTerm: q,
      meta: {
        description: `Resultados de búsqueda para "${q}" en Galugas. Encuentra los mejores productos tecnológicos.`,
        keywords: `buscar, ${q}, resultados, productos, tecnología`
      }
    });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    req.flash('error_msg', 'Error en la búsqueda');
    res.redirect('/catalogo');
  }
});

module.exports = router;