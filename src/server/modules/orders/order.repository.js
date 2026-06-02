// modules/orders/order.repository.js
const pool = require('../../config/db');

/**
 * Obtiene todas las órdenes de un usuario
 */
const getOrdersByUserId = async (usuario_id) => {
  const [rows] = await pool.query(
    `SELECT p.pedido_id, p.usuario_id, p.fecha, p.total, p.estado_id, ep.nombre as estado
     FROM pedido p
     LEFT JOIN estado_pedido ep ON p.estado_id = ep.estado_pedido_id
     WHERE p.usuario_id = ?
     ORDER BY p.fecha DESC`,
    [usuario_id]
  );
  return rows;
};

/**
 * Obtiene una orden por ID
 */
const getOrderById = async (pedido_id) => {
  const [rows] = await pool.query(
    `SELECT p.*, ep.nombre as estado
     FROM pedido p
     LEFT JOIN estado_pedido ep ON p.estado_id = ep.estado_pedido_id
     WHERE p.pedido_id = ?`,
    [pedido_id]
  );
  return rows[0] || null;
};

/**
 * Obtiene los items de una orden
 */
const getOrderItems = async (pedido_id) => {
  const [rows] = await pool.query(
    `SELECT pdi.pedido_dispositivo_id, pdi.pedido_id, pdi.dispositivo_id, pdi.cantidad, pdi.precio_unitario,
            d.nombre, d.pathFoto
     FROM pedido_dispositivo pdi
     JOIN dispositivo d ON pdi.dispositivo_id = d.dispositivo_id
     WHERE pdi.pedido_id = ?`,
    [pedido_id]
  );
  return rows;
};

/**
 * Crea una nueva orden (requiere transacción)
 */
const createOrder = async (usuario_id, items, total) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Crear orden
    const [result] = await connection.query(
      `INSERT INTO pedido (usuario_id, fecha, total, estado_id) VALUES (?, NOW(), ?, 1)`,
      [usuario_id, total]
    );

    const pedido_id = result.insertId;

    // Insertar items
    for (const item of items) {
      await connection.query(
        `INSERT INTO pedido_dispositivo (pedido_id, dispositivo_id, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [pedido_id, item.dispositivo_id, item.cantidad, item.precio_unitario]
      );
    }

    await connection.commit();
    return pedido_id;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Actualiza el estado de una orden
 */
const updateOrderStatus = async (pedido_id, estado_id) => {
  await pool.query(
    `UPDATE pedido SET estado_id = ? WHERE pedido_id = ?`,
    [estado_id, pedido_id]
  );
};

/**
 * Obtiene todos los estados de pedidos
 */
const getOrderStatuses = async () => {
  const [rows] = await pool.query('SELECT * FROM estado_pedido');
  return rows;
};

module.exports = {
  getOrdersByUserId,
  getOrderById,
  getOrderItems,
  createOrder,
  updateOrderStatus,
  getOrderStatuses
};
