const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.render('modules/admin/dashboard', { title: 'Panel de Administración' }));
router.get('/products', (req, res) => res.render('modules/admin/products', { title: 'Gestionar productos' }));
router.get('/categories', (req, res) => res.render('modules/admin/categories', { title: 'Gestionar categorías' }));
router.get('/brands', (req, res) => res.render('modules/admin/brands', { title: 'Gestionar marcas' }));
router.get('/users', (req, res) => res.render('modules/admin/users', { title: 'Gestionar usuarios' }));
router.get('/inventory', (req, res) => res.render('modules/admin/inventory', { title: 'Gestionar inventario' }));

module.exports = router;