// controllers/feePlanController.js
const FeePlan = require('../models/FeePlan');

exports.list = async (req, res) => {
  try {
    const plans = await FeePlan.find().populate('heads');
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fee plans', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const plan = new FeePlan(req.body);
    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create fee plan', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const plan = await FeePlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ message: 'Not found' });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update fee plan', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const plan = await FeePlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete fee plan', error: err.message });
  }
};
