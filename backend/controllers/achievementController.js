// backend/controllers/achievementController.js
const Achievement = require('../models/Achievement');
const Student = require('../models/Student');
const User = require('../models/User');

// Get all achievements for a specific student (approved only for students, all for admins)
exports.getStudentAchievements = async (req, res) => {
  try {
    const { studentId } = req.params;
    const userRole = req.user?.role;

    // Build query based on role
    const query = { studentId };
    if (userRole !== 'admin') {
      query.status = 'approved';
    }

    const achievements = await Achievement.find(query)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: achievements,
      count: achievements.length
    });
  } catch (error) {
    console.error('Error fetching student achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements',
      error: error.message
    });
  }
};

// Get all pending achievements (admin only)
exports.getPendingAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ status: 'pending' })
      .populate('studentId', 'firstName lastName studentId programName')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: achievements,
      count: achievements.length
    });
  } catch (error) {
    console.error('Error fetching pending achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending achievements',
      error: error.message
    });
  }
};

// Create a new achievement
exports.createAchievement = async (req, res) => {
  try {
    const { studentId, title, description, imageUrl } = req.body;

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Create achievement
    const achievement = new Achievement({
      studentId,
      title,
      description,
      imageUrl: imageUrl || null,
      createdBy: req.user.id || req.user._id,
      status: 'pending'
    });

    await achievement.save();

    // Populate for response
    await achievement.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'studentId', select: 'firstName lastName studentId' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully and sent for approval',
      data: achievement
    });
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create achievement',
      error: error.message
    });
  }
};

// Approve achievement (admin only)
exports.approveAchievement = async (req, res) => {
  try {
    const { id } = req.params;

    const achievement = await Achievement.findById(id);
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    if (achievement.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Achievement is already ${achievement.status}`
      });
    }

    achievement.status = 'approved';
    achievement.approvedBy = req.user._id;
    achievement.approvalDate = new Date();
    await achievement.save();

    await achievement.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'approvedBy', select: 'name email' },
      { path: 'studentId', select: 'firstName lastName studentId' }
    ]);

    res.json({
      success: true,
      message: 'Achievement approved successfully',
      data: achievement
    });
  } catch (error) {
    console.error('Error approving achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve achievement',
      error: error.message
    });
  }
};

// Reject achievement (admin only)
exports.rejectAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const achievement = await Achievement.findById(id);
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    if (achievement.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Achievement is already ${achievement.status}`
      });
    }

    achievement.status = 'rejected';
    achievement.rejectedBy = req.user._id;
    achievement.rejectionDate = new Date();
    achievement.rejectionReason = reason || 'No reason provided';
    await achievement.save();

    await achievement.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'rejectedBy', select: 'name email' },
      { path: 'studentId', select: 'firstName lastName studentId' }
    ]);

    res.json({
      success: true,
      message: 'Achievement rejected',
      data: achievement
    });
  } catch (error) {
    console.error('Error rejecting achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject achievement',
      error: error.message
    });
  }
};

// Delete achievement
exports.deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;

    const achievement = await Achievement.findByIdAndDelete(id);
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete achievement',
      error: error.message
    });
  }
};

// Get achievement by ID
exports.getAchievementById = async (req, res) => {
  try {
    const { id } = req.params;

    const achievement = await Achievement.findById(id)
      .populate('studentId', 'firstName lastName studentId programName')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email');

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      data: achievement
    });
  } catch (error) {
    console.error('Error fetching achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievement',
      error: error.message
    });
  }
};
