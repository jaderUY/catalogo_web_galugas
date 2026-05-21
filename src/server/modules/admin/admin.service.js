const pool = require('../../config/db');

// === PRODUCTOS ===
const getAllProducts = async () => {
    const [rows] = await pool.query(`
        SELECT d.*, m.nombre as marca_nombre, c.nombre as categoria_nombre, i.cantidadStock as stock
        FROM dispositivo d
        LEFT JOIN marca m ON d.marca_id = m.marca_id
        LEFT JOIN categoria c ON d.categoria_id = c.categoria_id
        LEFT JOIN inventario_dispositivo idisp ON d.dispositivo_id = idisp.dispositivo_id
        LEFT JOIN inventario i ON idisp.inventario_id = i.inventario_id
    `);
    return rows;
};

const createProduct = async (data) => {
    const { nombre, slug, precio, pathFoto, fechaLanzamiento, marca_id, categoria_id, estado_id, informacionTecnica_id, stock } = data;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [res] = await connection.query(
            `INSERT INTO dispositivo (nombre, slug, precio, pathFoto, fechaLanzamiento, marca_id, categoria_id, estado_id, informacionTecnica_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, slug, precio, pathFoto, fechaLanzamiento, marca_id, categoria_id, estado_id, informacionTecnica_id]
        );
        const dispositivo_id = res.insertId;
        // Inventario
        const [inv] = await connection.query(
            `INSERT INTO inventario (fechaActualizacion, cantidadStock, ubicacionAlmacen) VALUES (CURDATE(), ?, 'Principal')`,
            [stock || 0]
        );
        await connection.query(`INSERT INTO inventario_dispositivo (inventario_id, dispositivo_id) VALUES (?, ?)`, [inv.insertId, dispositivo_id]);
        await connection.commit();
        return { dispositivo_id };
    } catch (e) { await connection.rollback(); throw e; }
    finally { connection.release(); }
};

const updateProduct = async (id, data) => {
    await pool.query(`UPDATE dispositivo SET ? WHERE dispositivo_id = ?`, [data, id]);
    return { dispositivo_id: id };
};

const deleteProduct = async (id) => {
    await pool.query(`DELETE FROM dispositivo WHERE dispositivo_id = ?`, [id]);
};

// === CATEGORÍAS ===
const getAllCategories = () => pool.query('SELECT * FROM categoria');
const createCategory = (nombre, descripcion) => pool.query('INSERT INTO categoria (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion]);
const updateCategory = (id, nombre, descripcion) => pool.query('UPDATE categoria SET nombre=?, descripcion=? WHERE categoria_id=?', [nombre, descripcion, id]);
const deleteCategory = (id) => pool.query('DELETE FROM categoria WHERE categoria_id=?', [id]);

// === MARCAS ===
const getAllBrands = () => pool.query('SELECT * FROM marca');
const createBrand = (nombre, pais_id, descripcion) => pool.query('INSERT INTO marca (nombre, pais_id, descripcion) VALUES (?, ?, ?)', [nombre, pais_id, descripcion]);
const updateBrand = (id, nombre, pais_id, descripcion) => pool.query('UPDATE marca SET nombre=?, pais_id=?, descripcion=? WHERE marca_id=?', [nombre, pais_id, descripcion, id]);
const deleteBrand = (id) => pool.query('DELETE FROM marca WHERE marca_id=?', [id]);

// === USUARIOS ===
const getAllUsers = async () => {
    const [rows] = await pool.query(`
        SELECT u.*, r.nombre as rol_nombre, e.direccionEmail as email
        FROM usuario u
        LEFT JOIN rol r ON u.rol_id = r.rol_id
        LEFT JOIN email e ON u.usuario_id = e.usuario_id
        GROUP BY u.usuario_id
    `);
    return rows;
};
const updateUserRole = (userId, rol_id) => pool.query('UPDATE usuario SET rol_id=? WHERE usuario_id=?', [rol_id, userId]);
const deleteUser = (userId) => pool.query('DELETE FROM usuario WHERE usuario_id=?', [userId]);

// === INVENTARIO ===
const getInventory = async () => {
    const [rows] = await pool.query(`
        SELECT i.inventario_id, i.cantidadStock, i.ubicacionAlmacen, d.nombre as producto
        FROM inventario i
        JOIN inventario_dispositivo idisp ON i.inventario_id = idisp.inventario_id
        JOIN dispositivo d ON idisp.dispositivo_id = d.dispositivo_id
    `);
    return rows;
};
const updateStock = async (inventario_id, cantidadStock) => {
    await pool.query(`UPDATE inventario SET cantidadStock=?, fechaActualizacion=CURDATE() WHERE inventario_id=?`, [cantidadStock, inventario_id]);
};

module.exports = {
    getAllProducts, createProduct, updateProduct, deleteProduct,
    getAllCategories, createCategory, updateCategory, deleteCategory,
    getAllBrands, createBrand, updateBrand, deleteBrand,
    getAllUsers, updateUserRole, deleteUser,
    getInventory, updateStock
};