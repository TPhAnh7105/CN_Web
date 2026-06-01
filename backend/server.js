require('dotenv').config({ path: '../.env' });
const app = require('./app');
const { connectDB, sequelize } = require('./src/config/db');

// Import các Models để Sequelize nhận diện
const User = require('./src/models/user.model');
const Category = require('./src/models/category.model');
const Product = require('./src/models/product.model');
const Transaction = require('./src/models/transaction.model');
const Order = require('./src/models/order.model');
const OrderItem = require('./src/models/orderItem.model');
const Segment = require('./src/models/segment.model');
const Type = require('./src/models/type.model');
const Style = require('./src/models/style.model');
const Review = require('./src/models/review.model');
const Voucher = require('./src/models/voucher.model');
const ChatLog = require('./src/models/chatLog.model');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        // Đồng bộ database
        await sequelize.sync({ alter: false });
        
        // Sync bảng Voucher độc lập
        await Voucher.sync();
        await ChatLog.sync();
        
        try {
            await sequelize.query("ALTER TABLE ChatLogs MODIFY role ENUM('user', 'model', 'system', 'admin', 'user_support') NOT NULL;");
            console.log('✅ Đã cập nhật cột role trong ChatLogs');
        } catch (e) {}

        try {
            await sequelize.query('ALTER TABLE Orders ADD COLUMN deliveryAddress TEXT NULL;');
        } catch (e) {}
        try {
            await sequelize.query('ALTER TABLE Products ADD COLUMN detailedDescription TEXT NULL;');
            console.log('✅ Đã thêm cột detailedDescription vào bảng Products');
        } catch (e) {}
        try {
            await sequelize.query('ALTER TABLE Orders ADD COLUMN voucherCode VARCHAR(255) NULL, ADD COLUMN discountAmount DECIMAL(15,2) DEFAULT 0;');
            console.log('✅ Đã thêm cột voucher vào bảng Orders');
        } catch (e) {}
        try {
            await sequelize.query('ALTER TABLE Vouchers ADD COLUMN oncePerUser BOOLEAN DEFAULT TRUE;');
            console.log('✅ Đã thêm cột oncePerUser vào bảng Vouchers');
        } catch (e) {}
        try {
            await sequelize.query('ALTER TABLE Vouchers ADD COLUMN startDate DATETIME NULL, ADD COLUMN endDate DATETIME NULL;');
            console.log('✅ Đã thêm cột ngày bắt đầu/kết thúc vào bảng Vouchers');
        } catch (e) {}
        console.log('✅ Đã đồng bộ tất cả các Models với MySQL!');

        app.listen(PORT, () => {
            console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Lỗi khởi động:', error.message);
    }
};

startServer();
