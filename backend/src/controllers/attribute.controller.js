const Attribute = require('../models/attribute.model');

exports.getAll = async (req, res) => {
    try {
        const list = await Attribute.findAll();
        res.json(list);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
    try {
        const { group, name } = req.body;
        const attr = await Attribute.create({ group, name });
        res.status(201).json(attr);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.delete = async (req, res) => {
    try {
        const attr = await Attribute.findByPk(req.params.id);
        if(attr) await attr.destroy();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
