const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Type = require('../models/type.model');
const Style = require('../models/style.model');
const Segment = require('../models/segment.model');

// Helper function to map product model into frontend-friendly schema
const mapProduct = (p) => {
    const raw = p.toJSON ? p.toJSON() : p;
    return {
        ...raw,
        room: p.Category ? p.Category.name : null,
        type: p.Type ? p.Type.name : null,
        style: p.Style ? p.Style.name : null,
        segment: p.Segment ? p.Segment.name : null
    };
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [
                { model: Category, attributes: ['id', 'name'] },
                { model: Type, attributes: ['id', 'name'] },
                { model: Style, attributes: ['id', 'name'] },
                { model: Segment, attributes: ['id', 'name'] }
            ]
        });
        res.json(products.map(mapProduct));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single product
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                { model: Category, attributes: ['id', 'name'] },
                { model: Type, attributes: ['id', 'name'] },
                { model: Style, attributes: ['id', 'name'] },
                { model: Segment, attributes: ['id', 'name'] }
            ]
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(mapProduct(product));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create product
exports.createProduct = async (req, res) => {
    try {
        const { name, price, stock, description, mainImage, categoryId, segment, type, style } = req.body;
        
        // Resolve type text to typeId
        let typeId = null;
        if(type) {
            const typeRecord = await Type.findOne({ where: { name: type } });
            if(typeRecord) typeId = typeRecord.id;
        }
        
        // Resolve style text to styleId
        let styleId = null;
        if(style) {
            const styleRecord = await Style.findOne({ where: { name: style } });
            if(styleRecord) styleId = styleRecord.id;
        }
        // Resolve segment text to segmentId
        let segmentId = null;
        if(segment) {
            const segmentRecord = await Segment.findOne({ where: { name: segment } });
            if(segmentRecord) segmentId = segmentRecord.id;
        }
        
        const product = await Product.create({
            name, price, stock, description, mainImage, categoryId, typeId, styleId, segmentId
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        const { name, price, stock, description, mainImage, categoryId, segment, type, style } = req.body;
        const updateData = { name, price, stock, description, mainImage, categoryId };
        
        // Resolve type text to typeId if passed
        if (type !== undefined) {
            let typeId = null;
            if(type) {
                const typeRecord = await Type.findOne({ where: { name: type } });
                if(typeRecord) typeId = typeRecord.id;
            }
            updateData.typeId = typeId;
        }
        
        // Resolve style text to styleId if passed
        if (style !== undefined) {
            let styleId = null;
            if(style) {
                const styleRecord = await Style.findOne({ where: { name: style } });
                if(styleRecord) styleId = styleRecord.id;
            }
            updateData.styleId = styleId;
        }
        
        // Resolve segment text to segmentId if passed
        if (segment !== undefined) {
            let segmentId = null;
            if(segment) {
                const segmentRecord = await Segment.findOne({ where: { name: segment } });
                if(segmentRecord) segmentId = segmentRecord.id;
            }
            updateData.segmentId = segmentId;
        }
        
        await product.update(updateData);
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await product.destroy();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
