// modules/products/product.controller.js
const productService = require('./product.service');

const listProducts = async (req, res) => {
  const filters = req.query;
  const products = await productService.getProducts(filters);
  res.json({
    success: true,
    data: products
  });
};

const getProduct = async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  const userId = req.user?.usuario_id || null;
  
  // Registrar visualización
  await productService.registerProductView(req.params.id, userId);
  
  res.json({
    success: true,
    data: product
  });
};

const getCategories = async (req, res) => {
  const categories = await productService.getCategories();
  res.json({
    success: true,
    data: categories
  });
};

const getBrands = async (req, res) => {
  const brands = await productService.getBrands();
  res.json({
    success: true,
    data: brands
  });
};

const createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({
    success: true,
    message: 'Producto creado exitosamente',
    data: product
  });
};

const updateProduct = async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json({
    success: true,
    message: 'Producto actualizado exitosamente',
    data: product
  });
};

const deleteProduct = async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.json({
    success: true,
    message: 'Producto eliminado exitosamente'
  });
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