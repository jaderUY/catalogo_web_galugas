// modules/orders/order.pages.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');

router.get('/checkout', authMiddleware, (req, res) => {
  res.render('orders/checkout', { title: 'Finalizar Compra' });
});

router.get('/orders', authMiddleware, async (req, res) => {
  const orderService = require('./order.service');
  const orders = await orderService.getUserOrders(req.user.usuario_id);
  res.render('orders/history', { orders, title: 'Mis Pedidos' });
});

module.exports = router;