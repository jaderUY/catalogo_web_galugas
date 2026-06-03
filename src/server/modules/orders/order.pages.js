// modules/orders/order.pages.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');

router.get('/checkout', authMiddleware, (req, res) => {
  res.render('modules/orders/views/checkout', { title: 'Finalizar Compra' });
});

router.get('/orders', authMiddleware, async (req, res) => {
  const orderService = require('./order.service');
  const orders = await orderService.getUserOrders(req.user.usuario_id);
  res.render('modules/orders/views/history', { orders, title: 'Mis Pedidos' });
});

module.exports = router;