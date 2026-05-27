const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, reviewController.addProductReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/recent', reviewController.getRecentReviews);

module.exports = router;
