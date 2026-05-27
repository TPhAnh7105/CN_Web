const Review = require('../models/review.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');

exports.addProductReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        
        const review = await Review.create({
            rating,
            comment,
            userId: req.user.id,
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
