const Hall = require('../models/Hall');

/**
 * Create a new hall
 */
exports.createHall = async (req, res, next) => {
  try {
    const hall = new Hall(req.body);
    await hall.save();

    res.status(201).json({
      success: true,
      message: 'Hall created successfully',
      data: hall
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Hall ID or Camera ID already exists'
      });
    }
    next(err);
  }
};

/**
 * Get all halls
 */
exports.getAllHalls = async (req, res, next) => {
  try {
    const { isActive, cameraStatus, type } = req.query;
    
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (cameraStatus) filter.cameraStatus = cameraStatus;
    if (type) filter.type = type;

    const halls = await Hall.find(filter).sort({ hallId: 1 });

    res.json({
      success: true,
      count: halls.length,
      data: halls
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get hall by ID
 */
exports.getHallById = async (req, res, next) => {
  try {
    const hall = await Hall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found'
      });
    }

    res.json({
      success: true,
      data: hall
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update hall
 */
exports.updateHall = async (req, res, next) => {
  try {
    const hall = await Hall.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found'
      });
    }

    res.json({
      success: true,
      message: 'Hall updated successfully',
      data: hall
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete hall
 */
exports.deleteHall = async (req, res, next) => {
  try {
    const hall = await Hall.findByIdAndDelete(req.params.id);

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found'
      });
    }

    res.json({
      success: true,
      message: 'Hall deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update camera status
 */
exports.updateCameraStatus = async (req, res, next) => {
  try {
    const { cameraStatus } = req.body;

    const hall = await Hall.findByIdAndUpdate(
      req.params.id,
      { 
        cameraStatus,
        lastHealthCheck: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found'
      });
    }

    res.json({
      success: true,
      message: 'Camera status updated',
      data: hall
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get hall occupancy stats
 */
exports.getHallOccupancy = async (req, res, next) => {
  try {
    const ClassSession = require('../models/ClassSession');
    const { date } = req.query;
    
    const queryDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    const halls = await Hall.find({ isActive: true });
    
    const occupancyData = await Promise.all(halls.map(async (hall) => {
      const sessions = await ClassSession.find({
        hallId: hall._id,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['Ongoing', 'Completed'] }
      });

      const totalSessions = sessions.length;
      const ongoingSessions = sessions.filter(s => s.status === 'Ongoing').length;
      const avgAttendance = sessions.reduce((sum, s) => {
        const total = s.totalExpected || 1;
        const present = s.totalPresent || 0;
        return sum + (present / total * 100);
      }, 0) / (totalSessions || 1);

      return {
        hallId: hall.hallId,
        hallName: hall.hallName,
        capacity: hall.capacity,
        cameraStatus: hall.cameraStatus,
        totalSessions,
        ongoingSessions,
        avgAttendance: Math.round(avgAttendance)
      };
    }));

    res.json({
      success: true,
      date: queryDate,
      data: occupancyData
    });
  } catch (err) {
    next(err);
  }
};
