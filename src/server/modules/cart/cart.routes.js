// modules/cart/cart.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./cart.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');

router.use(authMiddleware); // Todas las rutas requieren autenticación
router.get('/', controller.getCart);
router.post('/add', controller.addToCart);
router.put('/:carrito_id', controller.updateCartItem);
router.delete('/:carrito_id', controller.removeFromCart);
router.delete('/', controller.clearCart);

module.exports = router;