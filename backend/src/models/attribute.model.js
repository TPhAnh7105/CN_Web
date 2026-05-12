const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Attribute = sequelize.define('Attribute', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    group: {
        type: DataTypes.ENUM('type', 'style', 'segment'),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false,
    indexes: [
        { unique: true, fields: ['group', 'name'] }
    ]
});

module.exports = Attribute;
