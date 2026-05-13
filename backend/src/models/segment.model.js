const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Segment = sequelize.define('Segment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: false
});

module.exports = Segment;
