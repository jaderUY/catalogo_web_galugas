const express = require('express');
const router = express.Router();
const reviewController = require('./review.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');

router.get('/:productId', reviewController.getProductReviews);
router.get('/:productId/rating', reviewController.getProductRating);
router.post('/', authMiddleware, reviewController.createReview);
router.put('/:resenia_id', authMiddleware, reviewController.updateReview);
router.delete('/:resenia_id', authMiddleware, reviewController.deleteReview);

module.exports = router;
