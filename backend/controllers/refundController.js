const refundService = require('../services/refund.service');

exports.list = async (req, res) => {
  try {
    const refunds = await refundService.listRefunds();
    res.json(refunds);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch refunds', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const refund = await refundService.createRefund(req.body);
    res.status(201).json(refund);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create refund', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const refund = await refundService.updateRefund(req.params.id, req.body);
    res.json(refund);
  } catch (err) {
    if (err.message === 'Refund not found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to update refund', error: err.message });
  }
};
