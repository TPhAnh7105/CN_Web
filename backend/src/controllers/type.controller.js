const Type = require('../models/type.model');

exports.getAll = async (req, res) => {
    try {
        const list = await Type.findAll();
        res.json(list);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
    try {
        const { name } = req.body;
        const item = await Type.create({ name });
        res.status(201).json(item);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.delete = async (req, res) => {
    try {
        const item = await Type.findByPk(req.params.id);
        if(item) await item.destroy();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
