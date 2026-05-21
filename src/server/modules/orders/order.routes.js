// modules/orders/order.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./order.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');

router.use(authMiddleware);
router.post('/checkout', controller.checkout);
router.get('/', controller.getOrders);

module.exports = router;