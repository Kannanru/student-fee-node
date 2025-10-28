const PenaltyConfig = require('../models/PenaltyConfig');

exports.createPenaltyConfig = async (req, res, next) => {
  try {
    const { academicYear, penaltyType } = req.body;
    if (!academicYear || !penaltyType) return res.status(400).json({ success: false, message: 'academicYear and penaltyType are required' });
    const existing = await PenaltyConfig.findOne({ academicYear });
    if (existing) return res.status(409).json({ success: false, message: 'Penalty config already exists for this academic year' });
    const cfg = new PenaltyConfig(req.body);
    await cfg.save();
    res.status(201).json({ success: true, message: 'Penalty configuration created successfully', data: cfg });
  } catch (err) { next(err); }
};

exports.getAllPenaltyConfigs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;
    const q = {};
    if (isActive != null) q.isActive = isActive === 'true';
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      PenaltyConfig.find(q).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      PenaltyConfig.countDocuments(q)
    ]);
    res.json({ success: true, message: 'Penalty configurations retrieved successfully', data: items, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), totalConfigs: total } });
  } catch (err) { next(err); }
};

exports.getPenaltyConfigByYear = async (req, res, next) => {
  try {
    const { academicYear } = req.params;
    const cfg = await PenaltyConfig.findOne({ academicYear, isActive: true });
    if (!cfg) return res.status(404).json({ success: false, message: 'Active penalty config not found for the given year' });
    res.json({ success: true, data: cfg });
  } catch (err) { next(err); }
};

exports.updatePenaltyConfig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = req.body;
    if (update.penaltyType === 'Percentage' && (update.penaltyPercentage == null || update.penaltyPercentage === '')) {
      return res.status(400).json({ success: false, message: 'penaltyPercentage is required for Percentage type' });
    }
    const cfg = await PenaltyConfig.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!cfg) return res.status(404).json({ success: false, message: 'Penalty config not found' });
    res.json({ success: true, message: 'Penalty configuration updated successfully', data: cfg });
  } catch (err) { next(err); }
};

exports.deletePenaltyConfig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await PenaltyConfig.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Penalty config not found' });
    res.json({ success: true, message: 'Penalty configuration deleted successfully' });
  } catch (err) { 
    if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid ID format' });
    next(err); 
  }
};
