// modules/products/product.repository.js
const pool = require('../../config/db');

/**
 * Obtiene productos con filtros opcionales
 */
const getProducts = async (filters = {}) => {
  let sql = `
    SELECT d.dispositivo_id, d.nombre, d.precio, d.pathFoto, d.fechaLanzamiento,
           m.nombre as marca, c.nombre as categoria,
           i.cantidadStock as stock
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

/**
 * Obtiene un producto por ID
 */
const getProductById = async (id) => {
  const [rows] = await pool.query(
    `SELECT d.*, m.nombre as marca, c.nombre as categoria,
            it.*, i.cantidadStock as stock
     FROM dispositivo d
     JOIN marca m ON d.marca_id = m.marca_id
     JOIN categoria c ON d.categoria_id = c.categoria_id
     LEFT JOIN informacionTecnica it ON d.informacionTecnica_id = it.informacionTecnica_id
     LEFT JOIN inventario_dispositivo idisp ON d.dispositivo_id = idisp.dispositivo_id
     LEFT JOIN inventario i ON idisp.inventario_id = i.inventario_id
     WHERE d.dispositivo_id = ?`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Registra una visualización de producto
 */
const registerProductView = async (dispositivo_id, usuario_id = null) => {
  await pool.query(
    `INSERT INTO producto_visto (usuario_id, dispositivo_id) VALUES (?, ?)`,
    [usuario_id, dispositivo_id]
  );
};

/**
 * Obtiene todas las categorías
 */
const getCategories = async () => {
  const [rows] = await pool.query('SELECT * FROM categoria');
  return rows;
};

/**
 * Obtiene todas las marcas
 */
const getBrands = async () => {
  const [rows] = await pool.query('SELECT * FROM marca');
  return rows;
};

/**
 * Crea un nuevo producto con stock (requiere transacción)
 */
const createProduct = async (productData) => {
  const {
    nombre,
    precio,
    pathFoto,
    fechaLanzamiento,
    marca_id,
    categoria_id,
    estado_id,
    informacionTecnica_id,
    stock
  } = productData;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insertar dispositivo
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
    return dispositivo_id;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Actualiza un producto existente
 */
const updateProduct = async (id, productData) => {
  const { nombre, precio, pathFoto, fechaLanzamiento, marca_id, categoria_id, estado_id } = productData;

  await pool.query(
    `UPDATE dispositivo SET nombre=?, precio=?, pathFoto=?, fechaLanzamiento=?, marca_id=?, categoria_id=?, estado_id=? WHERE dispositivo_id=?`,
    [nombre, precio, pathFoto, fechaLanzamiento, marca_id, categoria_id, estado_id, id]
  );
};

/**
 * Elimina un producto
 */
const deleteProduct = async (id) => {
  await pool.query(`DELETE FROM dispositivo WHERE dispositivo_id=?`, [id]);
};

/**
 * Obtiene el stock de un producto
 */
const getProductStock = async (dispositivo_id) => {
  const [rows] = await pool.query(
    `SELECT i.cantidadStock FROM inventario i
     JOIN inventario_dispositivo idisp ON i.inventario_id = idisp.inventario_id
     WHERE idisp.dispositivo_id = ?`,
    [dispositivo_id]
  );
  return rows[0]?.cantidadStock || 0;
};

module.exports = {
  getProducts,
  getProductById,
  registerProductView,
  getCategories,
  getBrands,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStock
};
