const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const productRoutes = require('./src/routes/product.routes');
const categoryRoutes = require('./src/routes/category.routes');
const authRoutes = require('./src/routes/auth.routes');
const orderRoutes = require('./src/routes/order.routes');
const userRoutes = require('./src/routes/user.routes');
const typeRoutes = require('./src/routes/type.routes');
const styleRoutes = require('./src/routes/style.routes');
const segmentRoutes = require('./src/routes/segment.routes');
const reviewRoutes = require('./src/routes/review.routes');
const voucherRoutes = require('./src/routes/voucher.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Logger
morgan.token('timestamp', () => new Date().toLocaleString('vi-VN'));
app.use(morgan(':timestamp | :method :url :status | :response-time ms'));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/styles', styleRoutes);
app.use('/api/segments', segmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/vouchers', voucherRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Furniture Store API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;
