// modules/reviews/review.service.js
const reviewRepository = require('./review.repository');
const productRepository = require('../products/product.repository');

/**
 * Crea una reseña con validaciones
 * @param {number} usuario_id - ID del usuario
 * @param {number} dispositivo_id - ID del dispositivo
 * @param {number} calificacion - Calificación (1-5)
 * @param {string} descripcion - Descripción de la reseña
 * @throws {Error} Si el usuario ya reseñó o hay validación fallida
 */
const createReview = async (usuario_id, dispositivo_id, calificacion, descripcion) => {
  // Validar que el producto exista
  const product = await productRepository.getProductById(dispositivo_id);
  if (!product) {
    throw new Error('Producto no encontrado');
  }

  // Validar calificación
  if (calificacion < 1 || calificacion > 5 || !Number.isInteger(calificacion)) {
    throw new Error('La calificación debe ser un número entero entre 1 y 5');
  }

  // Validar descripción
  if (!descripcion || descripcion.trim() === '') {
    throw new Error('La descripción es requerida');
  }

  if (descripcion.trim().length < 10) {
    throw new Error('La descripción debe tener al menos 10 caracteres');
  }

  // Verificar que el usuario no haya reseñado ya
  const hasReviewed = await reviewRepository.hasUserReviewedProduct(usuario_id, dispositivo_id);
  if (hasReviewed) {
    throw new Error('Ya has reseñado este producto');
  }

  const resenia_id = await reviewRepository.createReview({
    dispositivo_id,
    usuario_id,
    calificacion,
    descripcion
  });

  return { resenia_id };
};

/**
 * Obtiene todas las reseñas de un producto
 * @param {number} dispositivo_id - ID del dispositivo
 * @returns {Array} Reseñas del producto
 */
const getProductReviews = async (dispositivo_id) => {
  const reviews = await reviewRepository.getProductReviews(dispositivo_id);
  return reviews;
};

/**
 * Actualiza una reseña existente
 * @param {number} resenia_id - ID de la reseña
 * @param {number} usuario_id - ID del usuario (para validación)
 * @param {Object} reviewData - Datos a actualizar
 * @throws {Error} Si no tiene permisos o hay validación fallida
 */
const updateReview = async (resenia_id, usuario_id, reviewData) => {
  const review = await reviewRepository.getReviewById(resenia_id);
  if (!review) {
    throw new Error('Reseña no encontrada');
  }

  if (review.usuario_id !== usuario_id) {
    throw new Error('No tienes permiso para editar esta reseña');
  }

  const { calificacion, descripcion } = reviewData;

  if (calificacion && (calificacion < 1 || calificacion > 5)) {
    throw new Error('La calificación debe estar entre 1 y 5');
  }

  if (descripcion && descripcion.trim().length < 10) {
    throw new Error('La descripción debe tener al menos 10 caracteres');
  }

  await reviewRepository.updateReview(resenia_id, reviewData);
};

/**
 * Elimina una reseña
 * @param {number} resenia_id - ID de la reseña
 * @param {number} usuario_id - ID del usuario (para validación)
 * @throws {Error} Si no tiene permisos
 */
const deleteReview = async (resenia_id, usuario_id) => {
  const review = await reviewRepository.getReviewById(resenia_id);
  if (!review) {
    throw new Error('Reseña no encontrada');
  }

  if (review.usuario_id !== usuario_id) {
    throw new Error('No tienes permiso para eliminar esta reseña');
  }

  await reviewRepository.deleteReview(resenia_id);
};

/**
 * Obtiene la calificación promedio de un producto
 * @param {number} dispositivo_id - ID del dispositivo
 * @returns {Object} Promedio y total de reseñas
 */
const getProductRating = async (dispositivo_id) => {
  const rating = await reviewRepository.getProductAverageRating(dispositivo_id);
  return rating;
};

module.exports = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getProductRating
};