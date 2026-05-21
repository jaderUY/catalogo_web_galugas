// modules/products/product.controller.js
const productService = require('./product.service');

const listProducts = async (req, res, next) => {
  try {
    const filters = req.query;
    const products = await productService.getProducts(filters);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    const userId = req.user?.usuario_id || null;  // Si está logueado, toma su ID
    await productService.registerView(req.params.id, userId);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await productService.getCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const getBrands = async (req, res, next) => {
  try {
    const brands = await productService.getBrands();
    res.json(brands);
  } catch (error) {
    next(error);
  }
};

// Admin
const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProducts,
  getProduct,
  getCategories,
  getBrands,
  createProduct,
  updateProduct,
  deleteProduct
};