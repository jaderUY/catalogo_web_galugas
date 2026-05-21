const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.render('admin/dashboard', { title: 'Panel de Administración' }));
router.get('/products', (req, res) => res.render('admin/products', { title: 'Gestionar productos' }));
router.get('/categories', (req, res) => res.render('admin/categories', { title: 'Gestionar categorías' }));
router.get('/brands', (req, res) => res.render('admin/brands', { title: 'Gestionar marcas' }));
router.get('/users', (req, res) => res.render('admin/users', { title: 'Gestionar usuarios' }));
router.get('/inventory', (req, res) => res.render('admin/inventory', { title: 'Gestionar inventario' }));

module.exports = router;