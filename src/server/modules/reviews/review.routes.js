const express = require('express');
const router = express.Router();
const reviewController = require('./review.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');

router.get('/:productId', reviewController.getReviewsByProduct);
router.post('/', authMiddleware, reviewController.createReview);

module.exports = router;
