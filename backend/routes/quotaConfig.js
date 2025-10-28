// routes/quotaConfig.js
const express = require('express');
const router = express.Router();
const QuotaConfig = require('../models/QuotaConfig');
const auth = require('../middleware/auth');

// Get all quotas
router.get('/', auth, async (req, res) => {
  try {
    const quotas = await QuotaConfig.find().sort({ priority: 1 });
    res.json(quotas);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quotas', error: err.message });
  }
});

// Get active quotas
router.get('/active', auth, async (req, res) => {
  try {
    const quotas = await QuotaConfig.getActiveQuotas();
    res.json(quotas);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch active quotas', error: err.message });
  }
});

// Get single quota by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const quota = await QuotaConfig.findById(req.params.id);
    if (!quota) {
      return res.status(404).json({ message: 'Quota not found' });
    }
    res.json(quota);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quota', error: err.message });
  }
});

// Create new quota
router.post('/', auth, async (req, res) => {
  try {
    const quota = new QuotaConfig(req.body);
    await quota.save();
    res.status(201).json(quota);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Quota code already exists' });
    }
    res.status(500).json({ message: 'Failed to create quota', error: err.message });
  }
});

// Update quota
router.put('/:id', auth, async (req, res) => {
  try {
    const quota = await QuotaConfig.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!quota) {
      return res.status(404).json({ message: 'Quota not found' });
    }
    res.json(quota);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update quota', error: err.message });
  }
});

// Toggle quota status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const quota = await QuotaConfig.findById(req.params.id);
    if (!quota) {
      return res.status(404).json({ message: 'Quota not found' });
    }
    quota.active = !quota.active;
    await quota.save();
    res.json(quota);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update quota status', error: err.message });
  }
});

// Delete quota
router.delete('/:id', auth, async (req, res) => {
  try {
    const quota = await QuotaConfig.findByIdAndDelete(req.params.id);
    if (!quota) {
      return res.status(404).json({ message: 'Quota not found' });
    }
    res.json({ message: 'Quota deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete quota', error: err.message });
  }
});

module.exports = router;
