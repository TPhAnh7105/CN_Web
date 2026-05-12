const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.post('/deposit', auth, userController.deposit);
router.get('/transactions', auth, userController.getTransactions);

// Admin
router.get('/', auth, admin, userController.getAllUsers);
router.delete('/:id', auth, admin, userController.deleteUser);

module.exports = router;
