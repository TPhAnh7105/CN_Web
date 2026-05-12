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
        const { items } = req.body;
        if (!items || items.length === 0) throw new Error('Giỏ hàng rỗng');

        let total = 0;
        // Calc total & fetch current prices
        const validItems = [];
        for(const item of items) {
            const p = await Product.findByPk(item.productId);
            if(!p) throw new Error(`SP ID ${item.productId} ko tồn tại`);
            total += Number(p.price) * item.quantity;
            validItems.push({ productId: p.id, quantity: item.quantity, price: p.price });
        }

        // Create pending order
        const order = await Order.create({
            userId: req.user.id,
            totalAmount: total,
            status: 'pending'
        }, { transaction: t });

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

        // Fetch User
        const customer = await User.findByPk(order.userId, { transaction: t, lock: true });
        const totalCost = parseFloat(order.totalAmount);

        // Check balance
        if (parseFloat(customer.balance) < totalCost) {
            throw new Error(`Số dư user không đủ (${customer.balance} < ${totalCost})`);
        }

        // Iterate items to check & deduct inventory
        for (const line of order.OrderItems) {
            const prod = await Product.findByPk(line.productId, { transaction: t, lock: true });
            if (prod.stock < line.quantity) {
                throw new Error(`SP '${prod.name}' không đủ kho (còn ${prod.stock})`);
            }
            // 1. Deduct inventory
            await prod.update({ stock: prod.stock - line.quantity }, { transaction: t });
        }

        // 2. Deduct balance
        await customer.update({ balance: parseFloat(customer.balance) - totalCost }, { transaction: t });

        // 3. Log Transaction
        await Transaction.create({
            userId: customer.id,
            type: 'payment',
            amount: totalCost,
            description: `Thanh toán đơn hàng #${order.id}`,
            status: 'completed'
        }, { transaction: t });

        // 4. Update Order state
        await order.update({ status: 'approved' }, { transaction: t });

        await t.commit();
        res.json({ success: true, message: 'Phê duyệt đơn hàng & Trừ tiền/kho thành công!' });

    } catch (err) {
        await t.rollback();
        res.status(400).json({ success: false, message: err.message });
    }
};

// 4. ADMIN CANCEL/REJECT
exports.rejectOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if(!order || order.status !== 'pending') return res.status(400).json({message: 'Ko hợp lệ'});
        await order.update({ status: 'cancelled' });
        res.json({ success: true, message: 'Đã hủy đơn hàng.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
