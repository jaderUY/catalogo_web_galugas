// modules/products/product.service.js
const productRepository = require('./product.repository');

/**
 * Obtiene lista de productos con filtros opcionales
 * @param {Object} filters - Filtros (categoria_id, marca_id, search, minPrice, maxPrice)
 * @returns {Array} Lista de productos
 */
const getProducts = async (filters = {}) => {
  const products = await productRepository.getProducts(filters);
  return products;
};

/**
 * Obtiene un producto por ID
 * @param {number} id - ID del producto
 * @returns {Object} Datos del producto
 * @throws {Error} Si el producto no existe
 */
const getProductById = async (id) => {
  const product = await productRepository.getProductById(id);
  if (!product) {
    throw new Error('Producto no encontrado');
  }
  return product;
};

/**
 * Registra una visualización de producto
 * @param {number} dispositivo_id - ID del dispositivo
 * @param {number} usuario_id - ID del usuario (opcional)
 */
const registerProductView = async (dispositivo_id, usuario_id = null) => {
  await productRepository.registerProductView(dispositivo_id, usuario_id);
};

/**
 * Obtiene todas las categorías
 * @returns {Array} Lista de categorías
 */
const getCategories = async () => {
  const categories = await productRepository.getCategories();
  return categories;
};

/**
 * Obtiene todas las marcas
 * @returns {Array} Lista de marcas
 */
const getBrands = async () => {
  const brands = await productRepository.getBrands();
  return brands;
};

/**
 * Crea un nuevo producto con validaciones de lógica de negocio
 * @param {Object} productData - Datos del producto
 * @returns {Object} Producto creado
 * @throws {Error} Si hay error de validación o BD
 */
const createProduct = async (productData) => {
  const { nombre, precio, stock } = productData;

  // Validaciones de lógica de negocio
  if (precio <= 0) {
    throw new Error('El precio debe ser mayor a 0');
  }

  if (stock < 0) {
    throw new Error('El stock no puede ser negativo');
  }

  if (!nombre || nombre.trim() === '') {
    throw new Error('El nombre del producto es requerido');
  }

  const dispositivo_id = await productRepository.createProduct(productData);
  return { dispositivo_id };
};

/**
 * Actualiza un producto existente
 * @param {number} id - ID del producto
 * @param {Object} productData - Datos a actualizar
 * @throws {Error} Si el producto no existe o hay error de validación
 */
const updateProduct = async (id, productData) => {
  // Verificar que existe
  const existing = await productRepository.getProductById(id);
  if (!existing) {
    throw new Error('Producto no encontrado');
  }

  const { precio } = productData;
  if (precio && precio <= 0) {
    throw new Error('El precio debe ser mayor a 0');
  }

  await productRepository.updateProduct(id, productData);
  return { dispositivo_id: id };
};

/**
 * Elimina un producto
 * @param {number} id - ID del producto
 * @throws {Error} Si el producto no existe
 */
const deleteProduct = async (id) => {
  // Verificar que existe
  const existing = await productRepository.getProductById(id);
  if (!existing) {
    throw new Error('Producto no encontrado');
  }

  await productRepository.deleteProduct(id);
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  getBrands,
  createProduct,
  updateProduct,
  deleteProduct,
  registerProductView
};