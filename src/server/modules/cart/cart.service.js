// modules/cart/cart.service.js
const pool = require('../../config/db');

const getCart = async (usuario_id) => {
  const [rows] = await pool.query(
    `SELECT c.carrito_id, c.cantidad, d.dispositivo_id, d.nombre, d.precio, d.pathFoto
     FROM carrito c
     JOIN dispositivo d ON c.dispositivo_id = d.dispositivo_id
     WHERE c.usuario_id = ?`,
    [usuario_id]
  );
  return rows;
};

const addToCart = async (usuario_id, dispositivo_id, cantidad = 1) => {
  const [existing] = await pool.query(
    `SELECT * FROM carrito WHERE usuario_id = ? AND dispositivo_id = ?`,
    [usuario_id, dispositivo_id]
  );
  if (existing.length > 0) {
    await pool.query(
      `UPDATE carrito SET cantidad = cantidad + ? WHERE usuario_id = ? AND dispositivo_id = ?`,
      [cantidad, usuario_id, dispositivo_id]
    );
  } else {
    await pool.query(
      `INSERT INTO carrito (usuario_id, dispositivo_id, cantidad) VALUES (?, ?, ?)`,
      [usuario_id, dispositivo_id, cantidad]
    );
  }
  return { message: 'Producto agregado al carrito' };
};

const updateCartItem = async (carrito_id, cantidad) => {
  await pool.query(`UPDATE carrito SET cantidad = ? WHERE carrito_id = ?`, [cantidad, carrito_id]);
  return { message: 'Cantidad actualizada' };
};

const removeFromCart = async (carrito_id) => {
  await pool.query(`DELETE FROM carrito WHERE carrito_id = ?`, [carrito_id]);
  return { message: 'Producto eliminado del carrito' };
};

const clearCart = async (usuario_id) => {
  await pool.query(`DELETE FROM carrito WHERE usuario_id = ?`, [usuario_id]);
  return { message: 'Carrito vaciado' };
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };