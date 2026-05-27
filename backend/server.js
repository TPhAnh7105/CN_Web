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

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        // Đồng bộ database
        await sequelize.sync({ alter: false });
        console.log('✅ Đã đồng bộ tất cả các Models với MySQL!');

        app.listen(PORT, () => {
            console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Lỗi khởi động:', error.message);
    }
};

startServer();
