import express from 'express';
import apiClient from '../services/APIClient.js';
import { PAGINATION } from '../constants/app.js';

const router = express.Router();

/**
 * GET - Página de inicio
 */
router.get('/', async (req, res, next) => {
  try {
    const response = await apiClient.getDispositivos({
      limit: 8,
      orderBy: 'fechaLanzamiento',
      orderDirection: 'DESC'
    });

    res.render('pages/home', {
      title: 'Inicio - Galugas | Tu Tienda de Tecnología',
      dispositivos: response.data?.data || [],
      meta: {
        description: 'Descubre los últimos dispositivos tecnológicos en Galugas. Smartphones, tablets, accesorios y más al mejor precio.',
        keywords: 'tecnología, smartphones, tablets, accesorios, galugas'
      }
    });
  } catch (error) {
    console.error('Error en inicio:', error.message);
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

/**
 * GET - Catálogo de productos
 */
router.get('/catalogo', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || PAGINATION.ITEMS_PER_PAGE, PAGINATION.MAX_ITEMS);
    const params = { ...req.query, limit };

    const [dispositivosResponse, categoriasResponse, marcasResponse] = await Promise.all([
      apiClient.getDispositivos(params),
      apiClient.getCategorias(),
      apiClient.getMarcas()
    ]);

    res.render('pages/catalog', {
      title: 'Catálogo de Productos - Galugas',
      dispositivos: dispositivosResponse.data?.data || [],
      categorias: categoriasResponse.data?.data || [],
      marcas: marcasResponse.data?.data || [],
      filters: req.query,
      meta: {
        description: 'Explora nuestro catálogo completo de dispositivos tecnológicos. Filtra por categoría, marca y precio.',
        keywords: 'catálogo, productos, smartphones, tablets, tecnología, comprar'
      }
    });
  } catch (error) {
    console.error('Error en catálogo:', error.message);
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

/**
 * GET - Detalle de producto
 */
router.get('/producto/:id', async (req, res, next) => {
  try {
    const response = await apiClient.getDispositivoById(req.params.id);
    const dispositivo = response.data?.data;

    if (!dispositivo) {
      req.flash('error_msg', 'Producto no encontrado');
      return res.redirect('/catalogo');
    }

    res.render('pages/product-detail', {
      title: `${dispositivo.nombre} - Galugas`,
      dispositivo,
      meta: {
        description: dispositivo.descripcion || `Descubre ${dispositivo.nombre} de ${dispositivo.marca_nombre}. ${dispositivo.precio ? `Precio: $${dispositivo.precio}` : ''}`,
        keywords: `${dispositivo.nombre}, ${dispositivo.marca_nombre}, ${dispositivo.categoria_nombre}, tecnología, comprar`,
        image: dispositivo.imagen_url
      }
    });
  } catch (error) {
    console.error('Error en detalle de producto:', error.message);
    req.flash('error_msg', 'Producto no encontrado');
    res.redirect('/catalogo');
  }
});

/**
 * GET - Página acerca de
 */
router.get('/about', (req, res) => {
  res.render('pages/about', {
    title: 'Acerca de Nosotros - Galugas',
    meta: {
      description: 'Conoce más sobre Galugas, tu tienda de confianza para dispositivos tecnológicos. Calidad, garantía y el mejor servicio.',
      keywords: 'acerca de, nosotros, historia, galugas, tecnología'
    }
  });
});

/**
 * GET - Página de contacto
 */
router.get('/contact', (req, res) => {
  res.render('pages/contact', {
    title: 'Contacto - Galugas',
    meta: {
      description: 'Contáctanos para consultas, soporte técnico o información sobre nuestros productos. Estamos aquí para ayudarte.',
      keywords: 'contacto, soporte, ayuda, consultas, galugas'
    }
  });
});

/**
 * POST - Procesar formulario de contacto
 */
router.post('/contact', async (req, res, next) => {
  try {
    const { nombre, email, asunto, mensaje } = req.body;

    // Validar datos básicos
    if (!nombre || !email || !asunto || !mensaje) {
      req.flash('error_msg', 'Por favor completa todos los campos');
      return res.redirect('/contact');
    }

    // Aquí se puede integrar un servicio de email (Nodemailer, SendGrid, etc.)
    console.log('📧 Nuevo mensaje de contacto:', { nombre, email, asunto, mensaje });

    req.flash('success_msg', '¡Mensaje enviado correctamente! Te contactaremos pronto.');
    res.redirect('/contact');
  } catch (error) {
    console.error('Error en formulario de contacto:', error.message);
    req.flash('error_msg', 'Error al enviar el mensaje. Por favor intenta nuevamente.');
    res.redirect('/contact');
  }
});

/**
 * GET - Búsqueda de productos
 */
router.get('/buscar', async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.redirect('/catalogo');
    }

    const response = await apiClient.searchDispositivos(q.trim(), {
      limit: PAGINATION.MAX_ITEMS
    });

    res.render('pages/catalog', {
      title: `Resultados para: "${q}" - Galugas`,
      dispositivos: response.data?.data || [],
      categorias: [],
      marcas: [],
      searchTerm: q,
      filters: { search: q },
      meta: {
        description: `Resultados de búsqueda para "${q}" en Galugas. Encuentra los mejores productos tecnológicos.`,
        keywords: `buscar, ${q}, resultados, productos, tecnología`
      }
    });
  } catch (error) {
    console.error('Error en búsqueda:', error.message);
    req.flash('error_msg', 'Error en la búsqueda');
    res.redirect('/catalogo');
  }
});

export default router;