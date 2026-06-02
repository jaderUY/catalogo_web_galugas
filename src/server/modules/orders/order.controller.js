// modules/orders/order.controller.js
const orderService = require('./order.service');

const checkout = async (req, res) => {
  const order = await orderService.createOrder(req.user.usuario_id);
  res.status(201).json({
    success: true,
    message: 'Orden creada exitosamente',
    data: order
  });
};

const getOrders = async (req, res) => {
  const orders = await orderService.getUserOrders(req.user.usuario_id);
  res.json({
    success: true,
    data: orders
  });
};

const getOrderDetail = async (req, res) => {
  const order = await orderService.getOrderDetails(req.params.pedido_id, req.user.usuario_id);
  res.json({
    success: true,
    data: order
  });
};

module.exports = {
  checkout,
  getOrders,
  getOrderDetail
};