const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucher.controller');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

router.post('/', auth, admin, voucherController.createVoucher);
router.get('/', auth, admin, voucherController.getVouchers);
router.delete('/:id', auth, admin, voucherController.deleteVoucher);
router.post('/apply', auth, voucherController.applyVoucher);

module.exports = router;
