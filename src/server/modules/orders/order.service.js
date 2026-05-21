// modules/orders/order.service.js
const pool = require('../../config/db');
const cartService = require('../cart/cart.service');

const createOrder = async (usuario_id, direccion_envio) => {
  const cart = await cartService.getCart(usuario_id);
  if (cart.length === 0) throw new Error('El carrito está vacío');
  let total = 0;
  for (const item of cart) {
    total += item.precio * item.cantidad;
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [orderResult] = await connection.query(
      `INSERT INTO pedido (usuario_id, total, direccion_envio) VALUES (?, ?, ?)`,
      [usuario_id, total, direccion_envio]
    );
    const pedido_id = orderResult.insertId;
    for (const item of cart) {
      await connection.query(
        `INSERT INTO pedido_detalle (pedido_id, dispositivo_id, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [pedido_id, item.dispositivo_id, item.cantidad, item.precio]
      );
      // Descontar stock (usando inventario_dispositivo, asumiendo un solo inventario)
      await connection.query(
        `UPDATE inventario i
         JOIN inventario_dispositivo idisp ON i.inventario_id = idisp.inventario_id
         SET i.cantidadStock = i.cantidadStock - ?
         WHERE idisp.dispositivo_id = ?`,
        [item.cantidad, item.dispositivo_id]
      );
    }
    // Vaciar carrito
    await connection.query(`DELETE FROM carrito WHERE usuario_id = ?`, [usuario_id]);
    await connection.commit();
    return { pedido_id, total };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getUserOrders = async (usuario_id) => {
  const [rows] = await pool.query(
    `SELECT p.*, 
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('nombre', d.nombre, 'cantidad', pd.cantidad, 'precio', pd.precio_unitario))
             FROM pedido_detalle pd
             JOIN dispositivo d ON pd.dispositivo_id = d.dispositivo_id
             WHERE pd.pedido_id = p.pedido_id) AS detalles
     FROM pedido p
     WHERE p.usuario_id = ?
     ORDER BY p.fecha DESC`,
    [usuario_id]
  );
  return rows;
};

module.exports = { createOrder, getUserOrders };