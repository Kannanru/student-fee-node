// controllers/refundController.js
const Refund = require('../models/Refund');

exports.list = async (req, res) => {
  try {
    const refunds = await Refund.find();
    res.json(refunds);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch refunds', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const refund = new Refund(req.body);
    await refund.save();
    res.status(201).json(refund);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create refund', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const refund = await Refund.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!refund) return res.status(404).json({ message: 'Not found' });
    res.json(refund);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update refund', error: err.message });
  }
};
