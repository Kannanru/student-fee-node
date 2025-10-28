const AttendanceSettings = require('../models/AttendanceSettings');

/**
 * Create attendance settings
 */
exports.createSettings = async (req, res, next) => {
  try {
    const settings = new AttendanceSettings(req.body);
    await settings.save();

    res.status(201).json({
      success: true,
      message: 'Settings created successfully',
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all settings
 */
exports.getAllSettings = async (req, res, next) => {
  try {
    const { department, program, isActive } = req.query;
    
    const filter = {};
    if (department) filter.department = department;
    if (program) filter.program = program;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const settings = await AttendanceSettings.find(filter).sort({ priority: -1, department: 1 });

    res.json({
      success: true,
      count: settings.length,
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get settings by ID
 */
exports.getSettingsById = async (req, res, next) => {
  try {
    const settings = await AttendanceSettings.findById(req.params.id);

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get applicable settings for department/program/year/semester
 */
exports.getApplicableSettings = async (req, res, next) => {
  try {
    const { department, program, year, semester } = req.query;

    const settings = await AttendanceSettings.getApplicableSettings(
      department,
      program,
      year ? parseInt(year) : null,
      semester ? parseInt(semester) : null
    );

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'No applicable settings found. Using default values.'
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update settings
 */
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await AttendanceSettings.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete settings
 */
exports.deleteSettings = async (req, res, next) => {
  try {
    const settings = await AttendanceSettings.findByIdAndDelete(req.params.id);

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    res.json({
      success: true,
      message: 'Settings deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create or update global default settings
 */
exports.setGlobalDefaults = async (req, res, next) => {
  try {
    const settings = await AttendanceSettings.findOneAndUpdate(
      { department: 'GLOBAL' },
      { 
        ...req.body,
        department: 'GLOBAL',
        program: null,
        year: null,
        semester: null,
        isActive: true
      },
      { 
        new: true, 
        upsert: true, 
        runValidators: true 
      }
    );

    res.json({
      success: true,
      message: 'Global settings updated successfully',
      data: settings
    });
  } catch (err) {
    next(err);
  }
};
