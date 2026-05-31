const Review = require('../models/review.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const OrderItem = require('../models/orderItem.model');

exports.addProductReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;
        
        // Kiểm tra xem người dùng đã mua sản phẩm này và đơn hàng đã thành công chưa
        const hasOrdered = await Order.findOne({
            where: { userId, status: 'approved' },
            include: [{
                model: OrderItem,
                where: { productId }
            }]
        });

        if (!hasOrdered) {
            return res.status(403).json({ message: 'Chỉ khách hàng đã đặt mua thành công (đơn hàng đã duyệt) mới có thể đánh giá.' });
        }

        const review = await Review.create({
            rating,
            comment,
            userId,
            productId
        });
        
        res.status(201).json({ success: true, review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { productId: req.params.productId },
            include: [{ model: User, attributes: ['username', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRecentReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: User, attributes: ['username'] },
                { model: Product, attributes: ['name', 'id'] }
            ],
            where: { rating: { [require('sequelize').Op.gte]: 4 } }, // Lấy các review tốt (>= 4 sao)
            order: [['createdAt', 'DESC']],
            limit: 6
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
