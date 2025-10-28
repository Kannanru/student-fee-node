const ClassSession = require('../models/ClassSession');
const Timetable = require('../models/Timetable');
const Hall = require('../models/Hall');
const Student = require('../models/Student');

/**
 * Create class session from timetable
 */
exports.createSession = async (req, res, next) => {
  try {
    const session = new ClassSession(req.body);
    await session.save();

    res.status(201).json({
      success: true,
      message: 'Class session created successfully',
      data: session
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Generate sessions from timetable for a specific date
 */
exports.generateSessionsFromTimetable = async (req, res, next) => {
  try {
    const { date, program, year, semester } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const sessionDate = new Date(date);
    const dayOfWeek = sessionDate.getDay();

    console.log(`🗓️ Generating sessions for ${sessionDate.toDateString()} (Day ${dayOfWeek})`);

    // Find timetable entries for this day
    const filter = {
      dayOfWeek,
      isActive: true
    };

    if (program) filter.programName = program;
    if (year) filter.year = parseInt(year);
    if (semester) filter.semester = parseInt(semester);

    const timetableEntries = await Timetable.find(filter)
      .populate('hallId', 'hallId hallName capacity')
      .populate('facultyId', 'firstName lastName');

    if (timetableEntries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No timetable entries found for this day'
      });
    }

    console.log(`📚 Found ${timetableEntries.length} timetable entries`);

    const createdSessions = [];
    const errors = [];

    for (const entry of timetableEntries) {
      try {
        // Parse start and end times
        const [startHour, startMin] = entry.startTime.split(':').map(Number);
        const [endHour, endMin] = entry.endTime.split(':').map(Number);

        const startTime = new Date(sessionDate);
        startTime.setHours(startHour, startMin, 0, 0);

        const endTime = new Date(sessionDate);
        endTime.setHours(endHour, endMin, 0, 0);

        // Check if session already exists
        const existing = await ClassSession.findOne({
          timetableId: entry._id,
          date: {
            $gte: new Date(sessionDate.setHours(0, 0, 0, 0)),
            $lt: new Date(sessionDate.setHours(23, 59, 59, 999))
          }
        });

        if (existing) {
          console.log(`⚠️ Session already exists for ${entry.className} - ${entry.periodNumber}`);
          continue;
        }

        // Get expected students for this program/year/semester
        const expectedStudents = await Student.find({
          programName: entry.programName,
          year: entry.year,
          semester: entry.semester,
          status: 'active'
        }).select('_id');

        const session = await ClassSession.create({
          timetableId: entry._id,
          hallId: entry.hallId?._id,
          date: sessionDate,
          periodNumber: entry.periodNumber,
          subject: entry.subject || entry.className,
          facultyId: entry.facultyId,
          facultyName: entry.facultyName || (entry.facultyId ? `${entry.facultyId.firstName} ${entry.facultyId.lastName}` : entry.instructor),
          program: entry.programName,
          department: entry.department,
          year: entry.year,
          semester: entry.semester,
          startTime,
          endTime,
          expectedStudents: expectedStudents.map(s => s._id),
          totalExpected: expectedStudents.length,
          status: 'Scheduled'
        });

        createdSessions.push(session);
        console.log(`✅ Created session: ${entry.className} (Period ${entry.periodNumber})`);

      } catch (err) {
        console.error(`❌ Error creating session for ${entry.className}:`, err.message);
        errors.push({
          timetableEntry: entry.className,
          error: err.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Generated ${createdSessions.length} sessions`,
      data: createdSessions,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Get sessions for a specific date
 */
exports.getSessionsByDate = async (req, res, next) => {
  try {
    const { date, program, year, semester, hallId } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    const filter = {
      date: { $gte: startOfDay, $lte: endOfDay }
    };

    if (program) filter.program = program;
    if (year) filter.year = parseInt(year);
    if (semester) filter.semester = parseInt(semester);
    if (hallId) filter.hallId = hallId;

    const sessions = await ClassSession.find(filter)
      .populate('hallId', 'hallId hallName capacity cameraStatus')
      .populate('facultyId', 'firstName lastName employeeId')
      .populate('timetableId')
      .sort({ startTime: 1, periodNumber: 1 });

    res.json({
      success: true,
      date: queryDate,
      count: sessions.length,
      data: sessions
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get session by ID
 */
exports.getSessionById = async (req, res, next) => {
  try {
    const session = await ClassSession.findById(req.params.id)
      .populate('hallId', 'hallId hallName capacity cameraStatus')
      .populate('facultyId', 'firstName lastName employeeId')
      .populate('timetableId');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update session status
 */
exports.updateSessionStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;

    const updateData = { status };
    if (status === 'Cancelled' && cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    }

    const session = await ClassSession.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      message: 'Session status updated',
      data: session
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get ongoing sessions
 */
exports.getOngoingSessions = async (req, res, next) => {
  try {
    const now = new Date();

    const sessions = await ClassSession.find({
      startTime: { $lte: now },
      endTime: { $gte: now },
      status: 'Ongoing'
    })
      .populate('hallId', 'hallId hallName capacity cameraStatus')
      .populate('facultyId', 'firstName lastName')
      .sort({ startTime: 1 });

    res.json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get session attendance details
 */
exports.getSessionAttendance = async (req, res, next) => {
  try {
    const Attendance = require('../models/Attendance');
    
    const session = await ClassSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const attendanceRecords = await Attendance.find({ sessionId: req.params.id })
      .populate('studentId', 'firstName lastName studentId programName year semester')
      .sort({ 'studentRef.studentName': 1 });

    const summary = {
      totalExpected: session.totalExpected,
      totalPresent: session.totalPresent,
      totalLate: session.totalLate,
      totalAbsent: session.totalAbsent,
      attendancePercentage: session.totalExpected > 0 
        ? Math.round((session.totalPresent / session.totalExpected) * 100) 
        : 0
    };

    res.json({
      success: true,
      session: {
        _id: session._id,
        subject: session.subject,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status
      },
      summary,
      attendanceRecords
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete session
 */
exports.deleteSession = async (req, res, next) => {
  try {
    const session = await ClassSession.findByIdAndDelete(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = exports;
