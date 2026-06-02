// modules/reviews/review.controller.js
const reviewService = require('./review.service');

const getProductReviews = async (req, res) => {
  const reviews = await reviewService.getProductReviews(req.params.dispositivo_id);
  res.json({
    success: true,
    data: reviews
  });
};

const createReview = async (req, res) => {
  const usuario_id = req.user?.usuario_id;
  if (!usuario_id) {
    throw new Error('Debe iniciar sesión para publicar una reseña');
  }

  const { dispositivo_id, calificacion, descripcion } = req.body;
  const review = await reviewService.createReview(usuario_id, dispositivo_id, calificacion, descripcion);

  res.status(201).json({
    success: true,
    message: 'Reseña publicada correctamente',
    data: review
  });
};

const updateReview = async (req, res) => {
  const usuario_id = req.user?.usuario_id;
  if (!usuario_id) {
    throw new Error('Debe iniciar sesión');
  }

  await reviewService.updateReview(req.params.resenia_id, usuario_id, req.body);
  res.json({
    success: true,
    message: 'Reseña actualizada correctamente'
  });
};

const deleteReview = async (req, res) => {
  const usuario_id = req.user?.usuario_id;
  if (!usuario_id) {
    throw new Error('Debe iniciar sesión');
  }

  await reviewService.deleteReview(req.params.resenia_id, usuario_id);
  res.json({
    success: true,
    message: 'Reseña eliminada correctamente'
  });
};

const getProductRating = async (req, res) => {
  const rating = await reviewService.getProductRating(req.params.dispositivo_id);
  res.json({
    success: true,
    data: rating
  });
};

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getProductRating
};
