// modules/products/product.service.js
const pool = require('../../config/db');

const getProducts = async (filters = {}) => {
  let sql = `
    SELECT d.dispositivo_id, d.nombre, d.precio, d.pathFoto, d.fechaLanzamiento,
           m.nombre as marca, c.nombre as categoria,
           i.stock
    FROM dispositivo d
    JOIN marca m ON d.marca_id = m.marca_id
    JOIN categoria c ON d.categoria_id = c.categoria_id
    LEFT JOIN inventario_dispositivo idisp ON d.dispositivo_id = idisp.dispositivo_id
    LEFT JOIN inventario i ON idisp.inventario_id = i.inventario_id
    WHERE 1=1
  `;
  const values = [];
  if (filters.categoria_id) {
    sql += ' AND d.categoria_id = ?';
    values.push(filters.categoria_id);
  }
  if (filters.marca_id) {
    sql += ' AND d.marca_id = ?';
    values.push(filters.marca_id);
  }
  if (filters.search) {
    sql += ' AND d.nombre LIKE ?';
    values.push(`%${filters.search}%`);
  }
  if (filters.minPrice) {
    sql += ' AND d.precio >= ?';
    values.push(filters.minPrice);
  }
  if (filters.maxPrice) {
    sql += ' AND d.precio <= ?';
    values.push(filters.maxPrice);
  }
  const [rows] = await pool.query(sql, values);
  return rows;
};

const getProductById = async (id) => {
  const [rows] = await pool.query(
    `SELECT d.*, m.nombre as marca, c.nombre as categoria, 
            it.*, i.stock
     FROM dispositivo d
     JOIN marca m ON d.marca_id = m.marca_id
     JOIN categoria c ON d.categoria_id = c.categoria_id
     LEFT JOIN informacionTecnica it ON d.informacionTecnica_id = it.informacionTecnica_id
     LEFT JOIN inventario_dispositivo idisp ON d.dispositivo_id = idisp.dispositivo_id
     LEFT JOIN inventario i ON idisp.inventario_id = i.inventario_id
     WHERE d.dispositivo_id = ?`,
    [id]
  );
  return rows[0];
};

const registerView = async (dispositivo_id, usuario_id = null) => {
    await pool.query(`INSERT INTO producto_visto (usuario_id, dispositivo_id) VALUES (?, ?)`, [usuario_id, dispositivo_id]);
};

const getCategories = async () => {
  const [rows] = await pool.query('SELECT * FROM categoria');
  return rows;
};

const getBrands = async () => {
  const [rows] = await pool.query('SELECT * FROM marca');
  return rows;
};

// Admin only
const createProduct = async (productData) => {
  const { nombre, precio, pathFoto, fechaLanzamiento, marca_id, categoria_id, estado_id, informacionTecnica_id, stock } = productData;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      `INSERT INTO dispositivo (nombre, precio, pathFoto, fechaLanzamiento, marca_id, categoria_id, estado_id, informacionTecnica_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, precio, pathFoto, fechaLanzamiento, marca_id, categoria_id, estado_id, informacionTecnica_id]
    );
    const dispositivo_id = result.insertId;
    // Insertar stock en inventario
    const [invResult] = await connection.query(
      `INSERT INTO inventario (fechaActualizacion, cantidadStock, ubicacionAlmacen) VALUES (CURDATE(), ?, 'Principal')`,
      [stock]
    );
    const inventario_id = invResult.insertId;
    await connection.query(
      `INSERT INTO inventario_dispositivo (inventario_id, dispositivo_id) VALUES (?, ?)`,
      [inventario_id, dispositivo_id]
    );
    await connection.commit();
    return { dispositivo_id };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateProduct = async (id, productData) => {
  const { nombre, precio, pathFoto, fechaLanzamiento, marca_id, categoria_id, estado_id } = productData;
  await pool.query(
    `UPDATE dispositivo SET nombre=?, precio=?, pathFoto=?, fechaLanzamiento=?, marca_id=?, categoria_id=?, estado_id=? WHERE dispositivo_id=?`,
    [nombre, precio, pathFoto, fechaLanzamiento, marca_id, categoria_id, estado_id, id]
  );
  return { dispositivo_id: id };
};

const deleteProduct = async (id) => {
  await pool.query(`DELETE FROM dispositivo WHERE dispositivo_id=?`, [id]);
  return { dispositivo_id: id };
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  getBrands,
  createProduct,
  updateProduct,
  deleteProduct
};