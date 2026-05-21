// modules/orders/order.controller.js
const orderService = require('./order.service');

const checkout = async (req, res, next) => {
  try {
    const { direccion_envio } = req.body;
    const order = await orderService.createOrder(req.user.usuario_id, direccion_envio);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user.usuario_id);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = { checkout, getOrders };