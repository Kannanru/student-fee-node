const PenaltyConfig = require('../models/PenaltyConfig');

// Create Penalty Configuration
exports.createPenaltyConfig = async (req, res, next) => {
  try {
    const {
      academicYear, penaltyType, penaltyAmount, penaltyPercentage,
      gracePeriodDays, maxPenaltyAmount, description
    } = req.body;

    // Validate required fields
    if (!academicYear || !penaltyType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors: [
          ...(!academicYear ? [{ field: 'academicYear', message: 'Academic year is required' }] : []),
          ...(!penaltyType ? [{ field: 'penaltyType', message: 'Penalty type is required' }] : [])
        ]
      });
    }

    // Validate penalty type specific fields
    const validationErrors = [];
    
    if (penaltyType === 'Fixed' || penaltyType === 'Daily') {
      if (!penaltyAmount) {
        validationErrors.push({
          field: 'penaltyAmount',
          message: `Penalty amount is required for ${penaltyType} penalty type`
        });
      }
    }
    
    if (penaltyType === 'Percentage') {
      if (!penaltyPercentage) {
        validationErrors.push({
          field: 'penaltyPercentage',
          message: 'Penalty percentage is required for Percentage penalty type'
        });
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Check if configuration already exists for the academic year
    const existingConfig = await PenaltyConfig.findOne({ academicYear });
    if (existingConfig) {
      return res.status(409).json({
        success: false,
        message: 'Penalty configuration already exists for this academic year',
        error: {
          field: 'academicYear',
          message: 'Duplicate configuration for academic year'
        }
      });
    }

    // Create penalty configuration
    const penaltyConfig = new PenaltyConfig({
      academicYear,
      penaltyType,
      penaltyAmount: penaltyAmount || 0,
      penaltyPercentage: penaltyPercentage || 0,
      gracePeriodDays: gracePeriodDays || 0,
      maxPenaltyAmount,
      description
    });

    await penaltyConfig.save();

    res.status(201).json({
      success: true,
      message: 'Penalty configuration created successfully',
      data: penaltyConfig
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message,
        value: error.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Penalty configuration already exists for this academic year'
      });
    }

    next(err);
  }
};

// Get All Penalty Configurations
exports.getAllPenaltyConfigs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    
    const configs = await PenaltyConfig.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ academicYear: -1 });

    const total = await PenaltyConfig.countDocuments(filter);

    res.json({
      success: true,
      message: 'Penalty configurations retrieved successfully',
      data: configs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalConfigs: total
      }
    });

  } catch (err) {
    next(err);
  }
};

// Get Penalty Configuration by Academic Year
exports.getPenaltyConfigByYear = async (req, res, next) => {
  try {
    const { academicYear } = req.params;

    const config = await PenaltyConfig.findOne({ academicYear, isActive: true });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Penalty configuration not found for the specified academic year',
        error: {
          field: 'academicYear',
          message: 'No active penalty configuration exists for this academic year'
        }
      });
    }

    res.json({
      success: true,
      message: 'Penalty configuration retrieved successfully',
      data: config
    });

  } catch (err) {
    next(err);
  }
};

// Update Penalty Configuration
exports.updatePenaltyConfig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Validate penalty type specific fields if updating
    if (updateData.penaltyType) {
      if (updateData.penaltyType === 'Percentage' && !updateData.penaltyPercentage) {
        return res.status(400).json({
          success: false,
          message: 'Penalty percentage is required for Percentage penalty type',
          error: {
            field: 'penaltyPercentage',
            message: 'Missing required field for penalty type'
          }
        });
      }
    }

    const config = await PenaltyConfig.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Penalty configuration not found',
        error: {
          field: 'id',
          message: 'No penalty configuration exists with the provided ID'
        }
      });
    }

    res.json({
      success: true,
      message: 'Penalty configuration updated successfully',
      data: config
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    next(err);
  }
};

// Delete Penalty Configuration
exports.deletePenaltyConfig = async (req, res, next) => {
  try {
    const { id } = req.params;

    const config = await PenaltyConfig.findByIdAndDelete(id);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Penalty configuration not found',
        error: {
          field: 'id',
          message: 'No penalty configuration exists with the provided ID'
        }
      });
    }

    res.json({
      success: true,
      message: 'Penalty configuration deleted successfully',
      data: { id }
    });

  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid penalty configuration ID format',
        error: {
          field: 'id',
          message: 'ID must be a valid ObjectId'
        }
      });
    }
    next(err);
  }
};