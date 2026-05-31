const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user.model');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    totalAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'cancelled'),
        defaultValue: 'pending'
    },
    paymentMethod: {
        type: DataTypes.ENUM('wallet', 'cod', 'bank_transfer'),
        defaultValue: 'wallet'
    },
    deliveryAddress: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    voucherCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    discountAmount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    }
}, {
    timestamps: true
});

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

module.exports = Order;
