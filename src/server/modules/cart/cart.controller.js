// modules/cart/cart.controller.js
const cartService = require('./cart.service');

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.usuario_id);
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { dispositivo_id, cantidad } = req.body;
    const result = await cartService.addToCart(req.user.usuario_id, dispositivo_id, cantidad);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { cantidad } = req.body;
    const result = await cartService.updateCartItem(req.params.carrito_id, cantidad);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const result = await cartService.removeFromCart(req.params.carrito_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const result = await cartService.clearCart(req.user.usuario_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };