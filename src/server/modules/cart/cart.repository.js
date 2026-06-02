// modules/cart/cart.repository.js
const pool = require('../../config/db');

/**
 * Obtiene el carrito de un usuario
 */
const getCartByUserId = async (usuario_id) => {
  const [rows] = await pool.query(
    `SELECT ca.carrito_id, ca.usuario_id, ca.fechaCreacion
     FROM carrito ca
     WHERE ca.usuario_id = ?`,
    [usuario_id]
  );
  return rows[0] || null;
};

/**
 * Crea un carrito para un usuario
 */
const createCart = async (usuario_id) => {
  const [result] = await pool.query(
    `INSERT INTO carrito (usuario_id, fechaCreacion) VALUES (?, NOW())`,
    [usuario_id]
  );
  return result.insertId;
};

/**
 * Obtiene los items del carrito
 */
const getCartItems = async (carrito_id) => {
  const [rows] = await pool.query(
    `SELECT ci.carrito_item_id, ci.carrito_id, ci.dispositivo_id, ci.cantidad,
            d.nombre, d.precio, d.pathFoto, i.cantidadStock as stock
     FROM carrito_item ci
     JOIN dispositivo d ON ci.dispositivo_id = d.dispositivo_id
     LEFT JOIN inventario_dispositivo idisp ON d.dispositivo_id = idisp.dispositivo_id
     LEFT JOIN inventario i ON idisp.inventario_id = i.inventario_id
     WHERE ci.carrito_id = ?`,
    [carrito_id]
  );
  return rows;
};

/**
 * Añade un item al carrito
 */
const addItemToCart = async (carrito_id, dispositivo_id, cantidad) => {
  const [result] = await pool.query(
    `INSERT INTO carrito_item (carrito_id, dispositivo_id, cantidad) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE cantidad = cantidad + ?`,
    [carrito_id, dispositivo_id, cantidad, cantidad]
  );
  return result.insertId;
};

/**
 * Actualiza la cantidad de un item en el carrito
 */
const updateCartItem = async (carrito_item_id, cantidad) => {
  await pool.query(
    `UPDATE carrito_item SET cantidad = ? WHERE carrito_item_id = ?`,
    [cantidad, carrito_item_id]
  );
};

/**
 * Elimina un item del carrito
 */
const removeCartItem = async (carrito_item_id) => {
  await pool.query(
    `DELETE FROM carrito_item WHERE carrito_item_id = ?`,
    [carrito_item_id]
  );
};

/**
 * Limpia todos los items del carrito
 */
const clearCart = async (carrito_id) => {
  await pool.query(
    `DELETE FROM carrito_item WHERE carrito_id = ?`,
    [carrito_id]
  );
};

module.exports = {
  getCartByUserId,
  createCart,
  getCartItems,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
