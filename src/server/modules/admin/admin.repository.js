// modules/admin/admin.repository.js
const pool = require('../../config/db');

/**
 * Obtiene todas las órdenes para administración
 */
const getAllOrders = async (filters = {}) => {
  let sql = `
    SELECT p.pedido_id, p.usuario_id, p.fecha, p.total, p.estado_id, ep.nombre as estado,
           u.primer_nombre, u.primer_apellido, e.direccionEmail
    FROM pedido p
    LEFT JOIN estado_pedido ep ON p.estado_id = ep.estado_pedido_id
    LEFT JOIN usuario u ON p.usuario_id = u.usuario_id
    LEFT JOIN email e ON u.usuario_id = e.usuario_id
    WHERE 1=1
  `;
  const values = [];

  if (filters.estado_id) {
    sql += ' AND p.estado_id = ?';
    values.push(filters.estado_id);
  }

  sql += ' ORDER BY p.fecha DESC';

  const [rows] = await pool.query(sql, values);
  return rows;
};

/**
 * Obtiene estadísticas generales
 */
const getDashboardStats = async () => {
  const [totalUsers] = await pool.query('SELECT COUNT(*) as total FROM usuario');
  const [totalOrders] = await pool.query('SELECT COUNT(*) as total FROM pedido');
  const [totalProducts] = await pool.query('SELECT COUNT(*) as total FROM dispositivo');
  const [totalRevenue] = await pool.query('SELECT SUM(total) as total FROM pedido WHERE estado_id IN (2, 3)');

  return {
    totalUsers: totalUsers[0]?.total || 0,
    totalOrders: totalOrders[0]?.total || 0,
    totalProducts: totalProducts[0]?.total || 0,
    totalRevenue: totalRevenue[0]?.total || 0
  };
};

/**
 * Obtiene los contactos sin resolver
 */
const getUnresolvedContacts = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM contacto WHERE resuelto = FALSE ORDER BY fecha ASC`
  );
  return rows;
};

/**
 * Obtiene las órdenes recientes
 */
const getRecentOrders = async (limit = 10) => {
  const [rows] = await pool.query(
    `SELECT p.pedido_id, p.fecha, p.total, ep.nombre as estado,
            u.primer_nombre, u.primer_apellido
     FROM pedido p
     LEFT JOIN estado_pedido ep ON p.estado_id = ep.estado_pedido_id
     LEFT JOIN usuario u ON p.usuario_id = u.usuario_id
     ORDER BY p.fecha DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
};

/**
 * Obtiene los productos más vendidos
 */
const getTopProducts = async (limit = 10) => {
  const [rows] = await pool.query(
    `SELECT d.dispositivo_id, d.nombre, d.precio, d.pathFoto,
            SUM(pdi.cantidad) as vendido, COUNT(DISTINCT p.pedido_id) as ordenes
     FROM dispositivo d
     LEFT JOIN pedido_dispositivo pdi ON d.dispositivo_id = pdi.dispositivo_id
     LEFT JOIN pedido p ON pdi.pedido_id = p.pedido_id
     GROUP BY d.dispositivo_id
     ORDER BY vendido DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
};

module.exports = {
  getAllOrders,
  getDashboardStats,
  getUnresolvedContacts,
  getRecentOrders,
  getTopProducts
};
