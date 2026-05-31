const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Voucher = sequelize.define('Voucher', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    discountPercent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 100
        }
    },
    maxDiscount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Giảm tối đa bao nhiêu tiền'
    },
    minOrderValue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100
    },
    usedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = Voucher;
