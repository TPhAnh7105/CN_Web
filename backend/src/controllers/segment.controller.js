const Segment = require('../models/segment.model');

exports.getAll = async (req, res) => {
    try {
        const list = await Segment.findAll();
        res.json(list);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
    try {
        const { name } = req.body;
        const item = await Segment.create({ name });
        res.status(201).json(item);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.delete = async (req, res) => {
    try {
        const item = await Segment.findByPk(req.params.id);
        if(item) await item.destroy();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
