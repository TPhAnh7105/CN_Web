require('dotenv').config({ path: '../.env' });
const chatController = require('./src/controllers/chat.controller');

const req = {
    body: {
        message: "Chào bạn, bên bạn có sản phẩm ưu đãi nào không?",
        history: [],
        sessionId: 'test_sess_001',
        userId: null
    }
};

const res = {
    statusCode: 200,
    status: function(code) {
        this.statusCode = code;
        return this;
    },
    json: function(data) {
        console.log("Status:", this.statusCode);
        console.log("Response:", JSON.stringify(data, null, 2));
    }
};

chatController.handleChat(req, res);
