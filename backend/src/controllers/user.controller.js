const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const { sequelize } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update profile/address/birthDate
exports.updateProfile = async (req, res) => {
    try {
        const { username, address, birthDate } = req.body;
        const user = await User.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (username) user.username = username;
        if (address !== undefined) user.address = address;
        if (birthDate !== undefined) user.birthDate = birthDate;
        
        await user.save();

        // Create a new JWT token with the updated user details
        const payload = {
            user: {
                id: user.id,
                role: user.role,
                username: user.username
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ success: true, user, token });
            }
        );
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Deposit money
exports.deposit = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { amount } = req.body;
        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            return res.status(400).json({ message: 'Số tiền không hợp lệ' });
        }
        const user = await User.findByPk(req.user.id, { transaction: t });
        user.balance = parseFloat(user.balance) + depositAmount;
        await user.save({ transaction: t });

        await Transaction.create({
            userId: req.user.id,
            type: 'deposit',
            amount: depositAmount,
            description: 'Nạp tiền vào ví',
            status: 'completed'
        }, { transaction: t });

        await t.commit();
        res.json({ success: true, newBalance: user.balance });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: err.message });
    }
};

// Get transactions
exports.getTransactions = async (req, res) => {
    try {
        const list = await Transaction.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(list);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ADMIN: Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const list = await User.findAll({ attributes: { exclude: ['password'] } });
        res.json(list);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ADMIN: Get all transactions globally
exports.getAllTransactions = async (req, res) => {
    try {
        const list = await Transaction.findAll({
            include: [{ model: User, attributes: ['username', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(list);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ADMIN: Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Không thể xóa Admin' });
        await user.destroy();
        res.json({ success: true, message: 'Đã xóa người dùng' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ADMIN: Block/Unblock user with reason
exports.blockUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy' });
        if (user.role === 'admin') return res.status(403).json({ message: 'Không thể khóa Admin khác' });

        const { reason, expiresAt } = req.body;
        
        // Toggle block state
        user.isBlocked = !user.isBlocked;
        if (user.isBlocked) {
            user.blockReason = reason || 'Vi phạm chính sách';
            user.blockExpiresAt = expiresAt ? new Date(expiresAt) : null;
        } else {
            user.blockReason = null;
            user.blockExpiresAt = null;
        }

        await user.save();
        res.json({ success: true, message: user.isBlocked ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản', isBlocked: user.isBlocked, blockReason: user.blockReason, blockExpiresAt: user.blockExpiresAt });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
