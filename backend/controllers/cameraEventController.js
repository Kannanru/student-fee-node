const AttendanceEvent = require('../models/AttendanceEvent');
const Student = require('../models/Student');
const Hall = require('../models/Hall');
const ClassSession = require('../models/ClassSession');
const Attendance = require('../models/Attendance');
const AttendanceSettings = require('../models/AttendanceSettings');
const { emitAttendanceEvent, emitException, emitSessionUpdate } = require('../config/socket');

/**
 * Process camera event (AI-based attendance)
 * Receives JSON from camera: { student_id, hall_id, timestamp, direction, confidence, spoof_score }
 */
exports.processCameraEvent = async (req, res, next) => {
  try {
    const { student_id, hall_id, timestamp, direction, confidence, spoof_score } = req.body;

    console.log('📹 Camera event received:', { student_id, hall_id, timestamp, direction, confidence });

    // Validate required fields
    if (!student_id || !hall_id || !timestamp || !direction || confidence === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: student_id, hall_id, timestamp, direction, confidence'
      });
    }

    // Find student by registration number
    const student = await Student.findOne({ studentId: student_id });
    if (!student) {
      console.log('❌ Student not found:', student_id);
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        code: 'STUDENT_NOT_FOUND'
      });
    }

    // Find hall by hallId
    const hall = await Hall.findOne({ hallId: hall_id });
    if (!hall) {
      console.log('❌ Hall not found:', hall_id);
      return res.status(404).json({
        success: false,
        message: 'Hall not found',
        code: 'HALL_NOT_FOUND'
      });
    }

    // Emit real-time event with full details
    emitAttendanceEvent({
      type: 'ATTENDANCE_EVENT',
      student: {
        id: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        program: student.programName,
        year: student.year,
        semester: student.semester
      },
      hall: {
        id: hall.hallId,
        name: hall.hallName
      },
      direction: direction.toUpperCase(),
      confidence,
      timestamp: new Date(timestamp)
    });

    // Get applicable settings
    const settings = await AttendanceSettings.getApplicableSettings(
      student.department || 'GLOBAL',
      student.programName,
      student.year,
      student.semester
    );

    const minConfidence = settings?.cameraSettings?.minConfidence || 0.85;
    const maxSpoofScore = settings?.cameraSettings?.maxSpoofScore || 0.1;

    // Validate confidence and spoof score
    if (confidence < minConfidence) {
      console.log('⚠️ Low confidence:', confidence);
      
      // Still create event but mark as rejected
      const event = await AttendanceEvent.create({
        studentId: student._id,
        studentRegNo: student_id,
        hallId: hall._id,
        timestamp: new Date(timestamp),
        direction: direction.toUpperCase(),
        confidence,
        spoofScore: spoof_score || 0,
        cameraId: hall.cameraId,
        deviceId: hall.deviceId,
        processingStatus: 'Rejected',
        rejectionReason: 'Low Confidence',
        isProcessed: true,
        processedAt: new Date()
      });

      return res.status(200).json({
        success: false,
        message: 'Confidence too low',
        code: 'LOW_CONFIDENCE',
        eventId: event._id,
        threshold: minConfidence
      });
    }

    if (spoof_score && spoof_score > maxSpoofScore) {
      console.log('⚠️ Spoof detected:', spoof_score);
      
      const event = await AttendanceEvent.create({
        studentId: student._id,
        studentRegNo: student_id,
        hallId: hall._id,
        timestamp: new Date(timestamp),
        direction: direction.toUpperCase(),
        confidence,
        spoofScore: spoof_score,
        cameraId: hall.cameraId,
        deviceId: hall.deviceId,
        processingStatus: 'Rejected',
        rejectionReason: 'Spoof Detected',
        isProcessed: true,
        processedAt: new Date()
      });

      // Emit exception event
      emitException({
        type: 'SPOOF_DETECTED',
        student: { id: student.studentId, name: student.studentName },
        hall: { id: hall.hallId, name: hall.hallName },
        confidence,
        spoofScore: spoof_score,
        reason: 'Spoof Detected',
        timestamp: new Date()
      });

      return res.status(200).json({
        success: false,
        message: 'Spoof attempt detected',
        code: 'SPOOF_DETECTED',
        eventId: event._id
      });
    }

    // Find matching class session
    const eventTime = new Date(timestamp);
    const session = await ClassSession.findOne({
      hallId: hall._id,
      startTime: { $lte: eventTime },
      endTime: { $gte: eventTime },
      status: { $in: ['Scheduled', 'Ongoing'] }
    });

    // Create attendance event
    const event = await AttendanceEvent.create({
      studentId: student._id,
      studentRegNo: student_id,
      hallId: hall._id,
      sessionId: session?._id,
      timestamp: eventTime,
      direction: direction.toUpperCase(),
      confidence,
      spoofScore: spoof_score || 0,
      cameraId: hall.cameraId,
      deviceId: hall.deviceId,
      processingStatus: session ? 'Pending' : 'Exception',
      rejectionReason: session ? null : 'No Matching Session',
      isProcessed: false
    });

    console.log('✅ Event created:', event._id);

    // If no session found, still emit the event for real-time display
    if (!session) {
      console.log('⚠️ No matching session found for this time');
      
      // Emit event even without session
      emitAttendanceEvent({
        type: 'ATTENDANCE_MARKED',
        student: {
          id: student.studentId,
          name: `${student.firstName} ${student.lastName}`,
          program: student.programName,
          year: student.year,
          semester: student.semester
        },
        hall: {
          id: hall.hallId,
          name: hall.hallName
        },
        session: null,
        direction: direction.toUpperCase(),
        status: 'No Session',
        timestamp: new Date(timestamp),
        confidence
      });
      
      return res.status(200).json({
        success: true,
        message: 'Event recorded but no matching session found',
        code: 'NO_SESSION',
        eventId: event._id
      });
    }

    // Process attendance based on direction
    let attendanceResult;
    if (direction.toUpperCase() === 'IN') {
      attendanceResult = await processInEvent(event, student, session, hall, settings);
    } else if (direction.toUpperCase() === 'OUT') {
      attendanceResult = await processOutEvent(event, student, session, hall, settings);
    }

    // Emit successful attendance event via Socket.IO
    emitAttendanceEvent({
      type: 'ATTENDANCE_MARKED',
      student: {
        id: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        program: student.programName,
        year: student.year,
        semester: student.semester
      },
      hall: {
        id: hall.hallId,
        name: hall.hallName
      },
      session: session ? {
        id: session._id,
        subject: session.subject,
        periodNumber: session.periodNumber
      } : null,
      direction: direction.toUpperCase(),
      status: attendanceResult?.status || 'Present',
      timestamp: new Date(timestamp),
      confidence
    });

    // Emit session statistics update
    const updatedSession = await ClassSession.findById(session._id);
    emitSessionUpdate(session._id, {
      sessionId: session._id,
      subject: session.subject,
      totalPresent: updatedSession.totalPresent,
      totalLate: updatedSession.totalLate,
      totalAbsent: updatedSession.totalAbsent,
      totalExpected: updatedSession.totalExpected
    });

    res.status(201).json({
      success: true,
      message: 'Attendance event processed successfully',
      eventId: event._id,
      sessionId: session._id,
      direction: direction.toUpperCase()
    });

  } catch (err) {
    console.error('❌ Error processing camera event:', err);
    next(err);
  }
};

/**
 * Process IN event - Mark student entry
 */
async function processInEvent(event, student, session, hall, settings) {
  try {
    const gracePeriod = settings?.gracePeriodMinutes || 10;
    const lateThreshold = settings?.lateThresholdMinutes || 10;

    const entryTime = event.timestamp;
    const sessionStart = session.startTime;
    
    // Calculate minutes late
    const minutesLate = Math.max(0, Math.round((entryTime - sessionStart) / (1000 * 60)));
    
    // Determine status
    let status = 'Present';
    if (minutesLate > lateThreshold) {
      status = 'Late';
    }

    console.log(`📍 Student ${student.studentId} entered ${minutesLate} min late - Status: ${status}`);

    // Create or update attendance record
    const attendanceRecord = await Attendance.findOneAndUpdate(
      {
        studentId: student._id,
        sessionId: session._id,
        date: new Date(session.date).setHours(0, 0, 0, 0)
      },
      {
        studentId: student._id,
        studentRef: {
          studentId: student.studentId,
          studentName: `${student.firstName} ${student.lastName}`,
          courseGroup: student.programName,
          academicYear: student.academicYear
        },
        className: session.subject,
        timetableId: session.timetableId,
        sessionId: session._id,
        hallId: hall._id,
        cameraId: hall.cameraId,
        date: session.date,
        classStartTime: session.startTime,
        classEndTime: session.endTime,
        timeIn: entryTime,
        status,
        lateMinutes: minutesLate,
        source: 'Auto',
        aiConfidence: event.confidence,
        $push: {
          entryLogs: {
            type: 'in',
            timestamp: entryTime,
            cameraId: hall.cameraId,
            location: hall.location,
            aiConfidence: event.confidence
          }
        }
      },
      { 
        upsert: true, 
        new: true, 
        runValidators: true,
        setDefaultsOnInsert: true 
      }
    );

    // Mark event as processed
    await event.markProcessed(attendanceRecord._id);

    // Update session stats
    await updateSessionStats(session._id);

    console.log('✅ Attendance record created/updated:', attendanceRecord._id);

    return attendanceRecord;
  } catch (err) {
    console.error('Error in processInEvent:', err);
    throw err;
  }
}

/**
 * Process OUT event - Mark student exit
 */
async function processOutEvent(event, student, session, hall, settings) {
  try {
    const exitTime = event.timestamp;

    console.log(`📤 Student ${student.studentId} exited at ${exitTime}`);

    // Find existing attendance record
    const attendanceRecord = await Attendance.findOne({
      studentId: student._id,
      sessionId: session._id,
      date: new Date(session.date).setHours(0, 0, 0, 0)
    });

    if (!attendanceRecord) {
      console.log('⚠️ No IN event found for this OUT event');
      await event.markRejected('No Matching IN Event');
      return null;
    }

    // Update timeOut and calculate duration
    attendanceRecord.timeOut = exitTime;
    
    if (attendanceRecord.timeIn) {
      attendanceRecord.duration = Math.round((exitTime - attendanceRecord.timeIn) / (1000 * 60));
    }

    // Add exit log
    attendanceRecord.entryLogs.push({
      type: 'out',
      timestamp: exitTime,
      cameraId: hall.cameraId,
      location: hall.location,
      aiConfidence: event.confidence
    });

    // Check for early leave
    if (exitTime < session.endTime) {
      const minutesEarly = Math.round((session.endTime - exitTime) / (1000 * 60));
      if (minutesEarly > 10) {
        attendanceRecord.status = 'Early Leave';
        attendanceRecord.flags.earlyLeave = true;
      }
    }

    // Check minimum presence threshold
    const presenceThreshold = settings?.presenceThresholdPercent || 70;
    const sessionDuration = Math.round((session.endTime - session.startTime) / (1000 * 60));
    const presencePercent = (attendanceRecord.duration / sessionDuration) * 100;

    if (presencePercent < presenceThreshold) {
      console.log(`⚠️ Insufficient presence: ${presencePercent.toFixed(1)}% (threshold: ${presenceThreshold}%)`);
      attendanceRecord.status = 'Absent';
      attendanceRecord.flags.absent = true;
      attendanceRecord.reasonForAbsence = `Insufficient presence duration (${presencePercent.toFixed(1)}%)`;
    }

    await attendanceRecord.save();
    await event.markProcessed(attendanceRecord._id);

    console.log('✅ Attendance record updated with OUT time');

    return attendanceRecord;
  } catch (err) {
    console.error('Error in processOutEvent:', err);
    throw err;
  }
}

/**
 * Update session attendance statistics
 */
async function updateSessionStats(sessionId) {
  try {
    const Attendance = require('../models/Attendance');
    
    const stats = await Attendance.aggregate([
      { $match: { sessionId: sessionId } },
      {
        $group: {
          _id: '$sessionId',
          totalPresent: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
          },
          totalLate: {
            $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] }
          },
          totalAbsent: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
          }
        }
      }
    ]);

    if (stats.length > 0) {
      await ClassSession.findByIdAndUpdate(sessionId, {
        totalPresent: stats[0].totalPresent,
        totalLate: stats[0].totalLate,
        totalAbsent: stats[0].totalAbsent,
        status: 'Ongoing'
      });
    }
  } catch (err) {
    console.error('Error updating session stats:', err);
  }
}

/**
 * Get unprocessed events (for exception queue)
 */
exports.getUnprocessedEvents = async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;

    const events = await AttendanceEvent.getUnprocessedEvents(parseInt(limit));

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get events by session
 */
exports.getEventsBySession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const events = await AttendanceEvent.find({ sessionId })
      .populate('studentId', 'firstName lastName studentId')
      .populate('hallId', 'hallId hallName')
      .sort({ timestamp: 1 });

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get exception events (rejected or no matching session)
 */
exports.getExceptionEvents = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {
      processingStatus: { $in: ['Rejected', 'Exception'] }
    };

    if (startDate && endDate) {
      filter.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const events = await AttendanceEvent.find(filter)
      .populate('studentId', 'firstName lastName studentId')
      .populate('hallId', 'hallId hallName')
      .sort({ timestamp: -1 })
      .limit(500);

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    next(err);
  }
};

module.exports = exports;
