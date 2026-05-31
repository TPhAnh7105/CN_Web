const Order = require('../models/order.model');
const OrderItem = require('../models/orderItem.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const { sequelize } = require('../config/db');

// 1. USER REQUESTS CHECKOUT (Create Pending Order)
exports.checkout = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { items, paymentMethod, deliveryAddress, voucherCode } = req.body;
        const validPaymentMethods = ['wallet', 'cod', 'bank_transfer'];
        const method = validPaymentMethods.includes(paymentMethod) ? paymentMethod : 'wallet';

        if (!items || items.length === 0) throw new Error('Giỏ hàng rỗng');
        if (!deliveryAddress || deliveryAddress.trim() === '') throw new Error('Vui lòng nhập địa chỉ giao hàng');

        let total = 0;
        // Calc total & fetch current prices
        const validItems = [];
        for(const item of items) {
            const p = await Product.findByPk(item.productId);
            if(!p) throw new Error(`SP ID ${item.productId} ko tồn tại`);
            const currentPrice = p.discountPrice ? Number(p.discountPrice) : Number(p.price);
            total += currentPrice * item.quantity;
            validItems.push({ productId: p.id, quantity: item.quantity, price: currentPrice });
        }

        let discountAmount = 0;
        let appliedVoucher = null;

        if (voucherCode) {
            const Voucher = require('../models/voucher.model');
            appliedVoucher = await Voucher.findOne({ where: { code: voucherCode.toUpperCase(), isActive: true }, transaction: t, lock: true });
            if (appliedVoucher) {
                if (appliedVoucher.usedCount >= appliedVoucher.usageLimit) {
                    throw new Error('Mã giảm giá đã hết lượt sử dụng');
                }
                if (total >= Number(appliedVoucher.minOrderValue)) {
                    discountAmount = (total * Number(appliedVoucher.discountPercent)) / 100;
                    if (appliedVoucher.maxDiscount && discountAmount > Number(appliedVoucher.maxDiscount)) {
                        discountAmount = Number(appliedVoucher.maxDiscount);
                    }
                    total -= discountAmount;
                    await appliedVoucher.increment('usedCount', { by: 1, transaction: t });
                } else {
                    throw new Error(`Đơn hàng tối thiểu ${Number(appliedVoucher.minOrderValue).toLocaleString()} ₫ để áp dụng mã này`);
                }
            } else {
                throw new Error('Mã giảm giá không hợp lệ');
            }
        }

        // Fetch User
        const customer = await User.findByPk(req.user.id, { transaction: t, lock: true });

        if (method === 'wallet') {
            if (parseFloat(customer.balance) < total) {
                throw new Error(`Số dư ví không đủ để thanh toán (${Number(customer.balance).toLocaleString()}đ < ${total.toLocaleString()}đ). Vui lòng nạp thêm.`);
            }
            
            // Deduct balance
            await customer.update({ balance: parseFloat(customer.balance) - total }, { transaction: t });
        }

        // Create pending order
        const order = await Order.create({
            userId: req.user.id,
            totalAmount: total,
            status: 'pending',
            paymentMethod: method,
            deliveryAddress: deliveryAddress,
            voucherCode: appliedVoucher ? appliedVoucher.code : null,
            discountAmount: discountAmount
        }, { transaction: t });

        if (method === 'wallet') {
            // Log payment transaction immediately
            await Transaction.create({
                userId: customer.id,
                type: 'payment',
                amount: total,
                description: `Thanh toán đơn hàng #${order.id}`,
                status: 'completed'
            }, { transaction: t });
        }

        // Insert line items
        for(const v of validItems) {
            await OrderItem.create({
                orderId: order.id,
                productId: v.productId,
                quantity: v.quantity,
                priceAtTime: v.price
            }, { transaction: t });
        }

        await t.commit();
        res.json({ success: true, message: 'Đã gửi yêu cầu đặt hàng! Chờ admin phê duyệt.', orderId: order.id });
    } catch (err) {
        await t.rollback();
        res.status(400).json({ success: false, message: err.message });
    }
};

// 2. ADMIN GET ALL PENDING (For dashboard)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                { model: User, attributes: ['id', 'username', 'email', 'balance'] },
                { model: OrderItem, include: [Product] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET PENDING COUNT (For admin polling)
exports.getPendingOrdersCount = async (req, res) => {
    try {
        const count = await Order.count({ where: { status: 'pending' } });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. ADMIN APPROVE ORDER (Deduct stock + wallet balance ACTUALLY here)
exports.approveOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id, {
            include: [{ model: OrderItem }],
            transaction: t,
            lock: true
        });

        if (!order) throw new Error('Ko thấy đơn hàng');
        if (order.status !== 'pending') throw new Error('Đơn hàng đã được xử lý trước đó');

        // Iterate items to check & deduct inventory
        for (const line of order.OrderItems) {
            const prod = await Product.findByPk(line.productId, { transaction: t, lock: true });
            if (prod.stock < line.quantity) {
                throw new Error(`SP '${prod.name}' không đủ kho (còn ${prod.stock})`);
            }
            // 1. Deduct inventory
            await prod.update({ stock: prod.stock - line.quantity }, { transaction: t });
        }

        // 4. Update Order state
        await order.update({ status: 'approved' }, { transaction: t });

        await t.commit();
        res.json({ success: true, message: 'Phê duyệt đơn hàng thành công!' });

    } catch (err) {
        await t.rollback();
        res.status(400).json({ success: false, message: err.message });
    }
};

// 4. ADMIN CANCEL/REJECT
exports.rejectOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const order = await Order.findByPk(req.params.id, { transaction: t, lock: true });
        if(!order || order.status !== 'pending') throw new Error('Ko hợp lệ hoặc đã xử lý');
        
        if (order.paymentMethod === 'wallet') {
            // Refund balance
            const customer = await User.findByPk(order.userId, { transaction: t, lock: true });
            const totalCost = parseFloat(order.totalAmount);
            
            await customer.update({ balance: parseFloat(customer.balance) + totalCost }, { transaction: t });
            
            // Log Refund Transaction
            await Transaction.create({
                userId: customer.id,
                type: 'deposit',
                amount: totalCost,
                description: `Hoàn tiền đơn hàng #${order.id} (Bị từ chối)`,
                status: 'completed'
            }, { transaction: t });
        }

        await order.update({ status: 'cancelled' }, { transaction: t });
        
        await t.commit();
        res.json({ success: true, message: 'Đã hủy đơn hàng.' });
    } catch (err) { 
        await t.rollback();
        res.status(500).json({ message: err.message }); 
    }
};
