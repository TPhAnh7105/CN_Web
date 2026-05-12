const express = require('express');
const router = express.Router();
const controller = require('../controllers/attribute.controller');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

router.get('/', controller.getAll);

// Protected modification access
router.post('/', auth, admin, controller.create);
router.delete('/:id', auth, admin, controller.delete);

module.exports = router;
