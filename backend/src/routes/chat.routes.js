const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

// We use protect if we want only logged in users to chat, 
// or without protect if guests can chat too. Let's make it public but pass user info if logged in.
// Actually, to make it simple and accessible, we'll allow public access, 
// but the frontend can pass a temporary session ID or user ID.
router.post('/', chatController.handleChat);

// Admin lấy danh sách logs
router.get('/logs', auth, admin, chatController.getLogs);

// Frontend user polling tin nhắn từ Admin
router.get('/session/:sessionId/replies', chatController.getAdminReplies);

// Admin gửi tin nhắn trả lời
router.post('/admin-reply', auth, admin, chatController.adminReply);

// Admin tạo mô tả sản phẩm bằng AI
router.post('/generate-description', auth, admin, chatController.generateDescription);

module.exports = router;
