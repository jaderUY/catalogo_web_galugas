// modules/products/product.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./product.controller');
const { authMiddleware, isAdmin } = require('../../middlewares/auth.middleware');

// Rutas públicas
router.get('/', controller.listProducts);
router.get('/categories', controller.getCategories);
router.get('/brands', controller.getBrands);
router.get('/:id', controller.getProduct);

// Rutas admin
router.post('/', authMiddleware, isAdmin, controller.createProduct);
router.put('/:id', authMiddleware, isAdmin, controller.updateProduct);
router.delete('/:id', authMiddleware, isAdmin, controller.deleteProduct);

module.exports = router;