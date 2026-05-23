// modules/products/product.pages.js
const express = require('express');
const router = express.Router();
const productService = require('./product.service');

router.get('/products', async (req, res) => {
  const products = await productService.getProducts();
  const categories = await productService.getCategories();
  res.render('modules/products/views/list', { products, categories, title: 'Catálogo' });
});

router.get('/products/:id', async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  if (!product) return res.status(404).send('Producto no encontrado');
  res.render('modules/products/views/detail', { product, title: product.nombre });
});

module.exports = router;