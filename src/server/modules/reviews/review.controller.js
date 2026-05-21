const reviewService = require('./review.service');

const getReviewsByProduct = async (req, res, next) => {
  try {
    const reviews = await reviewService.getReviewsByProduct(req.params.productId);
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const usuario_id = req.user?.usuario_id;
    if (!usuario_id) {
      return res.status(401).json({ message: 'Debe iniciar sesión para publicar una reseña' });
    }

    const { productId, calificacion, comentario } = req.body;
    if (!productId || !calificacion || !comentario) {
      return res.status(400).json({ message: 'Faltan datos para enviar la reseña' });
    }

    await reviewService.createReview(usuario_id, productId, calificacion, comentario);
    res.status(201).json({ message: 'Reseña publicada correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviewsByProduct,
  createReview
};
