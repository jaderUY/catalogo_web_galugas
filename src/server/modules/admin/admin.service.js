// modules/admin/admin.service.js
const adminRepository = require('./admin.repository');

/**
 * Obtiene todas las órdenes para administración
 * @param {Object} filters - Filtros opcionales
 * @returns {Array} Lista de órdenes
 */
const getAllOrders = async (filters = {}) => {
  const orders = await adminRepository.getAllOrders(filters);
  return orders;
};

/**
 * Obtiene estadísticas del dashboard
 * @returns {Object} Estadísticas generales
 */
const getDashboardStats = async () => {
  const stats = await adminRepository.getDashboardStats();
  return stats;
};

/**
 * Obtiene contactos sin resolver
 * @returns {Array} Contactos sin resolver
 */
const getUnresolvedContacts = async () => {
  const contacts = await adminRepository.getUnresolvedContacts();
  return contacts;
};

/**
 * Obtiene órdenes recientes
 * @param {number} limit - Límite de resultados
 * @returns {Array} Órdenes recientes
 */
const getRecentOrders = async (limit = 10) => {
  const orders = await adminRepository.getRecentOrders(limit);
  return orders;
};

/**
 * Obtiene los productos más vendidos
 * @param {number} limit - Límite de resultados
 * @returns {Array} Productos más vendidos
 */
const getTopProducts = async (limit = 10) => {
  const products = await adminRepository.getTopProducts(limit);
  return products;
};
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