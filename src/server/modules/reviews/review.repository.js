// modules/reviews/review.repository.js
const pool = require('../../config/db');

/**
 * Obtiene todas las reseñas de un producto
 */
const getProductReviews = async (dispositivo_id) => {
  const [rows] = await pool.query(
    `SELECT r.resenia_id, r.dispositivo_id, r.usuario_id, r.calificacion, r.descripcion, r.fecha,
            u.primer_nombre, u.primer_apellido
     FROM resenia r
     LEFT JOIN usuario u ON r.usuario_id = u.usuario_id
     WHERE r.dispositivo_id = ?
     ORDER BY r.fecha DESC`,
    [dispositivo_id]
  );
  return rows;
};

/**
 * Obtiene una reseña por ID
 */
const getReviewById = async (resenia_id) => {
  const [rows] = await pool.query(
    `SELECT * FROM resenia WHERE resenia_id = ?`,
    [resenia_id]
  );
  return rows[0] || null;
};

/**
 * Crea una nueva reseña
 */
const createReview = async (reviewData) => {
  const { dispositivo_id, usuario_id, calificacion, descripcion } = reviewData;

  const [result] = await pool.query(
    `INSERT INTO resenia (dispositivo_id, usuario_id, calificacion, descripcion, fecha)
     VALUES (?, ?, ?, ?, NOW())`,
    [dispositivo_id, usuario_id, calificacion, descripcion]
  );

  return result.insertId;
};

/**
 * Actualiza una reseña
 */
const updateReview = async (resenia_id, reviewData) => {
  const { calificacion, descripcion } = reviewData;

  await pool.query(
    `UPDATE resenia SET calificacion = ?, descripcion = ? WHERE resenia_id = ?`,
    [calificacion, descripcion, resenia_id]
  );
};

/**
 * Elimina una reseña
 */
const deleteReview = async (resenia_id) => {
  await pool.query(
    `DELETE FROM resenia WHERE resenia_id = ?`,
    [resenia_id]
  );
};

/**
 * Obtiene el promedio de calificación de un producto
 */
const getProductAverageRating = async (dispositivo_id) => {
  const [rows] = await pool.query(
    `SELECT AVG(calificacion) as promedio, COUNT(*) as total
     FROM resenia
     WHERE dispositivo_id = ?`,
    [dispositivo_id]
  );
  return rows[0] || { promedio: 0, total: 0 };
};

/**
 * Verifica si un usuario ya ha reseñado un producto
 */
const hasUserReviewedProduct = async (usuario_id, dispositivo_id) => {
  const [rows] = await pool.query(
    `SELECT resenia_id FROM resenia
     WHERE usuario_id = ? AND dispositivo_id = ?`,
    [usuario_id, dispositivo_id]
  );
  return rows.length > 0;
};

module.exports = {
  getProductReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getProductAverageRating,
  hasUserReviewedProduct
};
