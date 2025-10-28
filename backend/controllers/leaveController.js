const Leave = require('../models/Leave');
const Student = require('../models/Student');

// Apply leave
exports.applyLeave = async (req, res, next) => {
  try {
    const {
      studentId,
      startDate,
      endDate,
      reason,
      leaveType,
      remarks
    } = req.body;

    // Validate required fields
    if (!studentId || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, start date, end date, and reason are required'
      });
    }

    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Check for overlapping leaves
    const hasOverlap = await Leave.checkOverlap(studentId, start, end);
    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: 'Leave dates overlap with existing approved leave'
      });
    }

    // Create leave application
    const leave = await Leave.create({
      studentId,
      studentName: student.name || `${student.firstName} ${student.lastName}`,
      studentRegisterNumber: student.studentId || student.enrollmentNumber,
      programName: student.programName,
      year: student.year,
      section: student.section,
      startDate: start,
      endDate: end,
      numberOfDays,
      reason,
      leaveType: leaveType || 'Other',
      remarks,
      appliedBy: req.user?.id || req.user?._id,
      appliedByName: req.user?.name || 'Admin',
      appliedByRole: req.user?.role === 'student' ? 'student' : 'admin',
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave
    });
  } catch (error) {
    console.error('Error applying leave:', error);
    next(error);
  }
};

// Get all leave requests (with filters)
exports.getAllLeaves = async (req, res, next) => {
  try {
    const { status, studentId, programName, year, startDate, endDate } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (studentId) query.studentId = studentId;
    if (programName) query.programName = programName;
    if (year) query.year = parseInt(year);
    
    if (startDate || endDate) {
      query.$or = [];
      if (startDate) {
        query.$or.push({ startDate: { $gte: new Date(startDate) } });
      }
      if (endDate) {
        query.$or.push({ endDate: { $lte: new Date(endDate) } });
      }
    }

    const leaves = await Leave.find(query)
      .populate('studentId', 'name firstName lastName email programName year section')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: leaves
    });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    next(error);
  }
};

// Get leave by ID
exports.getLeaveById = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('studentId', 'name firstName lastName email programName year section');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }

    res.json({
      success: true,
      data: leave
    });
  } catch (error) {
    console.error('Error fetching leave:', error);
    next(error);
  }
};

// Get leaves for a specific student
exports.getStudentLeaves = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { status } = req.query;

    const query = { studentId };
    if (status) query.status = status;

    const leaves = await Leave.find(query).sort({ createdAt: -1 });

    console.log(`Found ${leaves.length} leaves for student ${studentId}`);

    res.json({
      success: true,
      count: leaves.length,
      leaves: leaves
    });
  } catch (error) {
    console.error('Error fetching student leaves:', error);
    next(error);
  }
};

// Approve leave
exports.approveLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Leave is already ${leave.status}`
      });
    }

    leave.status = 'approved';
    leave.approvedBy = req.user?.id || req.user?._id;
    leave.approvedByName = req.user?.name || 'Admin';
    leave.approvalDate = new Date();
    if (remarks) leave.remarks = remarks;

    await leave.save();

    res.json({
      success: true,
      message: 'Leave approved successfully',
      data: leave
    });
  } catch (error) {
    console.error('Error approving leave:', error);
    next(error);
  }
};

// Reject leave
exports.rejectLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Leave is already ${leave.status}`
      });
    }

    leave.status = 'rejected';
    leave.approvedBy = req.user?.id || req.user?._id;
    leave.approvedByName = req.user?.name || 'Admin';
    leave.approvalDate = new Date();
    leave.rejectionReason = rejectionReason;

    await leave.save();

    res.json({
      success: true,
      message: 'Leave rejected successfully',
      data: leave
    });
  } catch (error) {
    console.error('Error rejecting leave:', error);
    next(error);
  }
};

// Get students on leave for a specific date/date range
exports.getStudentsOnLeave = async (req, res, next) => {
  try {
    const { date, programName, year, section } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    // Parse the date and set to start of day to avoid timezone issues
    const checkDate = new Date(date);
    const startOfDay = new Date(checkDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(checkDate.setHours(23, 59, 59, 999));
    
    const query = {
      status: 'approved',
      // Check if the leave period overlaps with the requested date
      $or: [
        // Leave starts on the check date
        {
          startDate: { $gte: startOfDay, $lte: endOfDay }
        },
        // Leave ends on the check date
        {
          endDate: { $gte: startOfDay, $lte: endOfDay }
        },
        // Leave spans across the check date
        {
          startDate: { $lte: startOfDay },
          endDate: { $gte: endOfDay }
        }
      ]
    };

    if (programName) query.programName = programName;
    if (year) query.year = parseInt(year);
    if (section) query.section = section;

    const leaves = await Leave.find(query)
      .populate('studentId', 'name firstName lastName studentId enrollmentNumber rollNumber programName year section')
      .sort({ studentName: 1 });

    // Format response for frontend
    const students = leaves.map(leave => {
      const student = leave.studentId;
      return {
        // Use the actual student document fields if populated
        studentId: student?.studentId || leave.studentRegisterNumber,
        studentRegisterNumber: leave.studentRegisterNumber,
        rollNumber: student?.rollNumber || leave.studentRegisterNumber,
        studentName: leave.studentName,
        programName: leave.programName,
        year: leave.year,
        section: leave.section,
        reason: leave.reason,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        numberOfDays: leave.numberOfDays
      };
    });

    console.log('Students on leave:', students); // Debug log

    res.json({
      success: true,
      count: students.length,
      students: students
    });
  } catch (error) {
    console.error('Error fetching students on leave:', error);
    next(error);
  }
};

// Delete leave (only if pending)
exports.deleteLeave = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete approved or rejected leave'
      });
    }

    await Leave.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Leave deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting leave:', error);
    next(error);
  }
};

// Get leave statistics
exports.getLeaveStats = async (req, res, next) => {
  try {
    const stats = await Leave.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' }
        }
      }
    ]);

    const result = {
      pending: 0,
      approved: 0,
      rejected: 0,
      totalDays: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      if (stat._id === 'approved') {
        result.totalDays = stat.totalDays;
      }
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching leave stats:', error);
    next(error);
  }
};
