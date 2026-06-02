// modules/orders/order.service.js
const orderRepository = require('./order.repository');
const cartRepository = require('../cart/cart.repository');

/**
 * Crea una nueva orden a partir del carrito del usuario
 * @param {number} usuario_id - ID del usuario
 * @returns {Object} Datos de la orden creada
 * @throws {Error} Si el carrito está vacío o hay error en la transacción
 */
const createOrder = async (usuario_id) => {
  // Obtener carrito del usuario
  const cart = await cartRepository.getCartByUserId(usuario_id);
  if (!cart) {
    throw new Error('Usuario no tiene carrito');
  }

  // Obtener items del carrito
  const cartItems = await cartRepository.getCartItems(cart.carrito_id);
  if (cartItems.length === 0) {
    throw new Error('El carrito está vacío');
  }

  // Calcular total
  let total = 0;
  const items = cartItems.map(item => {
    const itemTotal = item.precio * item.cantidad;
    total += itemTotal;
    return {
      dispositivo_id: item.dispositivo_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio
    };
  });

  // Crear orden
  const pedido_id = await orderRepository.createOrder(usuario_id, items, total);

  // Limpiar carrito
  await cartRepository.clearCart(cart.carrito_id);

  return { pedido_id, total, itemsCount: items.length };
};

/**
 * Obtiene todas las órdenes de un usuario
 * @param {number} usuario_id - ID del usuario
 * @returns {Array} Órdenes del usuario
 */
const getUserOrders = async (usuario_id) => {
  const orders = await orderRepository.getOrdersByUserId(usuario_id);
  return orders;
};

/**
 * Obtiene los detalles de una orden específica
 * @param {number} pedido_id - ID de la orden
 * @param {number} usuario_id - ID del usuario (para validación)
 * @returns {Object} Detalles de la orden
 * @throws {Error} Si la orden no existe o no pertenece al usuario
 */
const getOrderDetails = async (pedido_id, usuario_id) => {
  const order = await orderRepository.getOrderById(pedido_id);
  if (!order) {
    throw new Error('Orden no encontrada');
  }

  if (order.usuario_id !== usuario_id) {
    throw new Error('No tienes permiso para ver esta orden');
  }

  const items = await orderRepository.getOrderItems(pedido_id);
  
  return {
    ...order,
    items
  };
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails
};