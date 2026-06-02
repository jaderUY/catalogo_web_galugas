// modules/cart/cart.service.js
const cartRepository = require('./cart.repository');
const productRepository = require('../products/product.repository');

/**
 * Obtiene o crea el carrito de un usuario
 * @param {number} usuario_id - ID del usuario
 * @returns {Array} Items en el carrito
 */
const getCart = async (usuario_id) => {
  let cart = await cartRepository.getCartByUserId(usuario_id);
  
  // Si no existe carrito, crearlo
  if (!cart) {
    const carrito_id = await cartRepository.createCart(usuario_id);
    cart = { carrito_id, usuario_id };
  }

  // Obtener items del carrito
  const items = await cartRepository.getCartItems(cart.carrito_id);
  return items;
};

/**
 * Añade un producto al carrito con validaciones
 * @param {number} usuario_id - ID del usuario
 * @param {number} dispositivo_id - ID del dispositivo
 * @param {number} cantidad - Cantidad a agregar
 * @throws {Error} Si el producto no existe o no hay stock
 */
const addToCart = async (usuario_id, dispositivo_id, cantidad = 1) => {
  // Validar que el producto exista
  const product = await productRepository.getProductById(dispositivo_id);
  if (!product) {
    throw new Error('Producto no encontrado');
  }

  // Validar cantidad
  if (cantidad <= 0) {
    throw new Error('La cantidad debe ser mayor a 0');
  }

  // Verificar stock disponible
  const availableStock = await productRepository.getProductStock(dispositivo_id);
  if (availableStock < cantidad) {
    throw new Error(`Stock insuficiente. Disponibles: ${availableStock}`);
  }

  // Obtener o crear carrito
  let cart = await cartRepository.getCartByUserId(usuario_id);
  if (!cart) {
    const carrito_id = await cartRepository.createCart(usuario_id);
    cart = { carrito_id };
  }

  // Añadir item al carrito
  await cartRepository.addItemToCart(cart.carrito_id, dispositivo_id, cantidad);
};

/**
 * Actualiza la cantidad de un item en el carrito
 * @param {number} carrito_item_id - ID del item en carrito
 * @param {number} cantidad - Nueva cantidad
 * @throws {Error} Si la cantidad es inválida o no hay stock
 */
const updateCartItem = async (carrito_item_id, cantidad) => {
  if (cantidad <= 0) {
    throw new Error('La cantidad debe ser mayor a 0');
  }

  await cartRepository.updateCartItem(carrito_item_id, cantidad);
};

/**
 * Elimina un item del carrito
 * @param {number} carrito_item_id - ID del item en carrito
 */
const removeFromCart = async (carrito_item_id) => {
  await cartRepository.removeCartItem(carrito_item_id);
};

/**
 * Limpia completamente el carrito de un usuario
 * @param {number} usuario_id - ID del usuario
 */
const clearCart = async (usuario_id) => {
  const cart = await cartRepository.getCartByUserId(usuario_id);
  if (cart) {
    await cartRepository.clearCart(cart.carrito_id);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};