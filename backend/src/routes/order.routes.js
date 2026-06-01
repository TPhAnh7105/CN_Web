const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

// User endpoints
router.post('/checkout', auth, orderController.checkout);
router.get('/myorders', auth, orderController.getMyOrders);

// Admin endpoints
router.get('/pending-count', auth, admin, orderController.getPendingOrdersCount);
router.get('/', auth, admin, orderController.getAllOrders);
router.put('/:id/approve', auth, admin, orderController.approveOrder);
router.put('/:id/reject', auth, admin, orderController.rejectOrder);

module.exports = router;
