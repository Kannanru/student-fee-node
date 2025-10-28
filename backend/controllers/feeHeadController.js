const feeHeadService = require('../services/feeHead.service');

exports.list = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await feeHeadService.listFeeHeads({ page: parseInt(page), limit: parseInt(limit) });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fee heads', error: err.message });
  }
};

exports.getActive = async (req, res) => {
  try {
    const heads = await feeHeadService.getActiveFeeHeads();
    res.json(heads);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch active fee heads', error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const head = await feeHeadService.getFeeHeadById(id);
    if (!head) {
      return res.status(404).json({ message: 'Fee head not found' });
    }
    res.json(head);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fee head', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const head = await feeHeadService.createFeeHead(req.body);
    res.status(201).json(head);
  } catch (err) {
    if (err.message === 'Code already exists') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to create fee head', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating fee head:', { id, updates: req.body });
    const head = await feeHeadService.updateFeeHead(id, req.body);
    console.log('Fee head updated successfully:', head._id);
    res.json(head);
  } catch (err) {
    console.error('Error updating fee head:', err);
    if (err.message === 'Fee head not found') {
      return res.status(404).json({ message: err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate code or unique field conflict' });
    }
    res.status(500).json({ message: 'Failed to update fee head', error: err.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const head = await feeHeadService.toggleFeeHeadStatus(id);
    res.json(head);
  } catch (err) {
    if (err.message === 'Fee head not found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to toggle fee head status', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await feeHeadService.deleteFeeHead(id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (err.message === 'Fee head not found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to delete fee head', error: err.message });
  }
};
