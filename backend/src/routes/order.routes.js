const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

// User endpoints
router.post('/checkout', auth, orderController.checkout);

// Admin endpoints
router.get('/', auth, admin, orderController.getAllOrders);
router.put('/:id/approve', auth, admin, orderController.approveOrder);
router.put('/:id/reject', auth, admin, orderController.rejectOrder);

module.exports = router;
