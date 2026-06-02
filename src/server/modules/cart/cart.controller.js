// modules/cart/cart.controller.js
const cartService = require('./cart.service');

const getCart = async (req, res) => {
  const cart = await cartService.getCart(req.user.usuario_id);
  res.json({
    success: true,
    data: cart
  });
};

const addToCart = async (req, res) => {
  const { dispositivo_id, cantidad = 1 } = req.body;
  await cartService.addToCart(req.user.usuario_id, dispositivo_id, cantidad);
  res.status(201).json({
    success: true,
    message: 'Producto agregado al carrito'
  });
};

const updateCartItem = async (req, res) => {
  const { cantidad } = req.body;
  await cartService.updateCartItem(req.params.carrito_item_id, cantidad);
  res.json({
    success: true,
    message: 'Cantidad actualizada'
  });
};

const removeFromCart = async (req, res) => {
  await cartService.removeFromCart(req.params.carrito_item_id);
  res.json({
    success: true,
    message: 'Producto eliminado del carrito'
  });
};

const clearCart = async (req, res) => {
  await cartService.clearCart(req.user.usuario_id);
  res.json({
    success: true,
    message: 'Carrito vaciado'
  });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};