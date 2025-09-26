// controllers/feeHeadController.js
const FeeHead = require('../models/FeeHead');

exports.list = async (req, res) => {
  try {
    const heads = await FeeHead.find();
    res.json(heads);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fee heads', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, code, taxability, glCode } = req.body;
    const existing = await FeeHead.findOne({ code });
    if (existing) return res.status(400).json({ message: 'Code already exists' });
    const head = new FeeHead({ name, code, taxability, glCode });
    await head.save();
    res.status(201).json(head);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create fee head', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const head = await FeeHead.findByIdAndUpdate(id, req.body, { new: true });
    if (!head) return res.status(404).json({ message: 'Not found' });
    res.json(head);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update fee head', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const head = await FeeHead.findByIdAndDelete(id);
    if (!head) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete fee head', error: err.message });
  }
};
