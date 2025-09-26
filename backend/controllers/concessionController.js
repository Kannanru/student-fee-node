// controllers/concessionController.js
const Concession = require('../models/Concession');

exports.list = async (req, res) => {
  try {
    const concessions = await Concession.find();
    res.json(concessions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch concessions', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const concession = new Concession(req.body);
    await concession.save();
    res.status(201).json(concession);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create concession', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const concession = await Concession.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!concession) return res.status(404).json({ message: 'Not found' });
    res.json(concession);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update concession', error: err.message });
  }
};
