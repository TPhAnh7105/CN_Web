const Voucher = require('../models/voucher.model');
const { Op } = require('sequelize');

exports.createVoucher = async (req, res) => {
    try {
        const { code, discountPercent, maxDiscount, minOrderValue, usageLimit, oncePerUser, startDate, endDate } = req.body;
        
        // check if code exists
        const existing = await Voucher.findOne({ where: { code: code.toUpperCase() } });
        if (existing) {
            return res.status(400).json({ message: 'Mã giảm giá đã tồn tại' });
        }

        const voucher = await Voucher.create({
            code: code.toUpperCase(),
            discountPercent,
            maxDiscount: maxDiscount || null,
            minOrderValue: minOrderValue || 0,
            usageLimit: usageLimit || 100,
            oncePerUser: oncePerUser !== undefined ? oncePerUser : true,
            startDate: startDate || null,
            endDate: endDate || null
        });

        res.status(201).json({ success: true, voucher });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(vouchers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        await Voucher.destroy({ where: { id } });
        res.json({ success: true, message: 'Đã xóa mã giảm giá' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.applyVoucher = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        if (!code) return res.status(400).json({ message: 'Vui lòng nhập mã giảm giá' });

        const voucher = await Voucher.findOne({ where: { code: code.toUpperCase(), isActive: true } });
        
        if (!voucher) {
            return res.status(404).json({ message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
        }

        if (voucher.usedCount >= voucher.usageLimit) {
            return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
        }

        if (voucher.oncePerUser) {
            const Order = require('../models/order.model');
            const alreadyUsed = await Order.findOne({
                where: {
                    userId: req.user.id,
                    voucherCode: voucher.code,
                    status: { [Op.ne]: 'cancelled' }
                }
            });
            if (alreadyUsed) {
                return res.status(400).json({ message: 'Tài khoản của bạn đã sử dụng mã giảm giá này rồi' });
            }
        }

        const now = new Date();
        if (voucher.startDate && now < new Date(voucher.startDate)) {
            return res.status(400).json({ message: 'Mã giảm giá chưa đến thời gian áp dụng' });
        }
        if (voucher.endDate && now > new Date(voucher.endDate)) {
            return res.status(400).json({ message: 'Mã giảm giá đã hết hạn sử dụng' });
        }

        if (Number(cartTotal) < Number(voucher.minOrderValue)) {
            return res.status(400).json({ message: `Đơn hàng tối thiểu ${Number(voucher.minOrderValue).toLocaleString()} ₫ để áp dụng mã này` });
        }

        let discountAmount = (Number(cartTotal) * Number(voucher.discountPercent)) / 100;
        if (voucher.maxDiscount && discountAmount > Number(voucher.maxDiscount)) {
            discountAmount = Number(voucher.maxDiscount);
        }

        res.json({
            success: true,
            voucherId: voucher.id,
            code: voucher.code,
            discountAmount,
            message: 'Áp dụng mã giảm giá thành công!'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
