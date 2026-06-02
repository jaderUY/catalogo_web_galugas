// modules/admin/admin.controller.js
const adminService = require('./admin.service');

// === Dashboard ===
const getDashboard = async (req, res) => {
  const stats = await adminService.getDashboardStats();
  const recentOrders = await adminService.getRecentOrders(10);
  const topProducts = await adminService.getTopProducts(10);
  const unresolvedContacts = await adminService.getUnresolvedContacts();

  res.json({
    success: true,
    data: {
      stats,
      recentOrders,
      topProducts,
      unresolvedContacts
    }
  });
};

// === Órdenes ===
const getAllOrders = async (req, res) => {
  const orders = await adminService.getAllOrders(req.query);
  res.json({
    success: true,
    data: orders
  });
};

const getRecentOrders = async (req, res) => {
  const limit = req.query.limit || 10;
  const orders = await adminService.getRecentOrders(limit);
  res.json({
    success: true,
    data: orders
  });
};

// === Productos más vendidos ===
const getTopProducts = async (req, res) => {
  const limit = req.query.limit || 10;
  const products = await adminService.getTopProducts(limit);
  res.json({
    success: true,
    data: products
  });
};

module.exports = {
  getDashboard,
  getAllOrders,
  getRecentOrders,
  getTopProducts
};