// controllers/settingsController.js
const Settings = require('../models/Settings');

exports.get = async (req, res) => {
  try {
    const settings = await Settings.find();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch settings', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { key, value } = req.body;
    const updated = await Settings.findOneAndUpdate({ key }, { value }, { new: true, upsert: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update settings', error: err.message });
  }
};
