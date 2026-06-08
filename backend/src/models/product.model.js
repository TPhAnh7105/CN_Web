const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Category = require('./category.model');
const Type = require('./type.model');
const Style = require('./style.model');
const Segment = require('./segment.model');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    originalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    discountPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    detailedDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    mainImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    colors: {
        type: DataTypes.STRING,
        allowNull: true
    },
    sizes: {
        type: DataTypes.STRING,
        allowNull: true
    },
    categoryId: {
        type: DataTypes.INTEGER,
        references: {
            model: Category,
            key: 'id'
        }
    },
    typeId: {
        type: DataTypes.INTEGER,
        references: {
            model: Type,
            key: 'id'
        }
    },
    styleId: {
        type: DataTypes.INTEGER,
        references: {
            model: Style,
            key: 'id'
        }
    },
    segmentId: {
        type: DataTypes.INTEGER,
        references: {
            model: Segment,
            key: 'id'
        }
    }
}, {
    timestamps: true
});

// Associations
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Type.hasMany(Product, { foreignKey: 'typeId' });
Product.belongsTo(Type, { foreignKey: 'typeId' });

Style.hasMany(Product, { foreignKey: 'styleId' });
Product.belongsTo(Style, { foreignKey: 'styleId' });

Segment.hasMany(Product, { foreignKey: 'segmentId' });
Product.belongsTo(Segment, { foreignKey: 'segmentId' });

module.exports = Product;
