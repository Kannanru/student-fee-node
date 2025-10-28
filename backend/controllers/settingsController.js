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

// Get late threshold setting
exports.getLateThreshold = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'lateThresholdMinutes' });
    const value = setting ? parseInt(setting.value) : 10; // Default: 10 minutes
    res.json({ success: true, data: { key: 'lateThresholdMinutes', value } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch late threshold', error: err.message });
  }
};

// Update late threshold setting
exports.updateLateThreshold = async (req, res) => {
  try {
    const { value } = req.body;
    
    // Validate value
    const minutes = parseInt(value);
    if (isNaN(minutes) || minutes < 0 || minutes > 60) {
      return res.status(400).json({ 
        success: false, 
        message: 'Late threshold must be between 0 and 60 minutes' 
      });
    }
    
    const updated = await Settings.findOneAndUpdate(
      { key: 'lateThresholdMinutes' }, 
      { key: 'lateThresholdMinutes', value: minutes }, 
      { new: true, upsert: true }
    );
    
    res.json({ 
      success: true, 
      message: `Late threshold updated to ${minutes} minutes`,
      data: updated 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update late threshold', error: err.message });
  }
};
