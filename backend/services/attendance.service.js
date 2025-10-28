const BaseService = require('./base.service');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Timetable = require('../models/Timetable');
const Settings = require('../models/Settings');

class AttendanceService extends BaseService {
  constructor() {
    super(Attendance);
  }

  /**
   * Record or upsert attendance
   * @param {Object} attendanceData - Full attendance record data
   * @returns {Promise<Object>}
   */
  async upsertAttendance(attendanceData) {
    const { studentId, date, className } = attendanceData;
    
    // Find and validate student
    const student = await Student.findById(studentId);
    if (!student) {
      throw { status: 404, message: 'Student not found' };
    }

    // Try to find matching timetable
    let timetableId;
    try {
      const dayOfWeek = new Date(date).getUTCDay();
      const timetables = await Timetable.find({
        programName: attendanceData.courseGroup || student.programName,
        academicYear: attendanceData.academicYear || student.academicYear,
        className,
        dayOfWeek
      });

      // Check time overlap
      const [startH, startM] = String(new Date(attendanceData.classStartTime).toISOString().substring(11, 16)).split(':').map(Number);
      const [endH, endM] = String(new Date(attendanceData.classEndTime).toISOString().substring(11, 16)).split(':').map(Number);
      const reqStart = startH * 60 + startM;
      const reqEnd = endH * 60 + endM;

      for (const t of timetables) {
        const tStart = parseInt(t.startTime.split(':')[0]) * 60 + parseInt(t.startTime.split(':')[1]);
        const tEnd = parseInt(t.endTime.split(':')[0]) * 60 + parseInt(t.endTime.split(':')[1]);
        const overlaps = !(reqEnd <= tStart || reqStart >= tEnd);
        if (overlaps) {
          timetableId = t._id;
          break;
        }
      }
    } catch (error) {
      // Ignore timetable matching errors
    }

    // Check late threshold and adjust status if needed
    let finalStatus = attendanceData.status;
    let lateMinutes = 0;
    
    if (attendanceData.status === 'Late' && attendanceData.timeIn && attendanceData.classStartTime) {
      // Calculate how late the student was
      const timeIn = new Date(attendanceData.timeIn);
      const classStart = new Date(attendanceData.classStartTime);
      lateMinutes = Math.floor((timeIn - classStart) / (1000 * 60)); // Minutes late
      
      // Get late threshold from settings (default: 10 minutes)
      let lateThreshold = 10;
      try {
        const setting = await Settings.findOne({ key: 'lateThresholdMinutes' });
        if (setting && setting.value) {
          lateThreshold = parseInt(setting.value);
        }
      } catch (error) {
        console.warn('Failed to fetch late threshold setting, using default:', error.message);
      }
      
      // If late minutes exceed threshold, mark as Absent
      if (lateMinutes >= lateThreshold) {
        finalStatus = 'Absent';
      }
    }

    // Build attendance document
    const doc = {
      studentId,
      studentRef: {
        studentId: student.studentId,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        courseGroup: attendanceData.courseGroup || student.programName,
        academicYear: attendanceData.academicYear || student.academicYear
      },
      className,
      timetableId,
      room: attendanceData.room,
      cameraId: attendanceData.cameraId,
      date: new Date(date),
      classStartTime: new Date(attendanceData.classStartTime),
      classEndTime: new Date(attendanceData.classEndTime),
      timeIn: attendanceData.timeIn ? new Date(attendanceData.timeIn) : undefined,
      timeOut: attendanceData.timeOut ? new Date(attendanceData.timeOut) : undefined,
      status: finalStatus,
      lateMinutes: lateMinutes > 0 ? lateMinutes : undefined,
      reasonForAbsence: finalStatus === 'Absent' && lateMinutes >= 10 ? `Late by ${lateMinutes} minutes (exceeds threshold)` : attendanceData.reasonForAbsence,
      aiConfidence: attendanceData.aiConfidence,
      entryLogs: Array.isArray(attendanceData.entryLogs) ? attendanceData.entryLogs : []
    };

    const options = { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true };
    const record = await Attendance.findOneAndUpdate(
      { studentId, date: new Date(date), className },
      doc,
      options
    );

    return { record, timetableId, warnings: timetableId ? undefined : ['No matching timetable found for this record'] };
  }

  /**
   * Record attendance
   * @param {Object} attendanceData
   * @returns {Promise<Object>}
   */
  async recordAttendance(attendanceData) {
    return await this.create(attendanceData);
  }

  /**
   * Get student daily attendance
   * @param {String} studentId
   * @param {Date} date
   * @returns {Promise<Array>}
   */
  async getStudentDaily(studentId, date) {
    const d = date ? new Date(date) : new Date();
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59));
    
    return await this.Model.find({
      studentId,
      date: { $gte: start, $lte: end }
    }).sort({ classStartTime: 1 });
  }

  /**
   * Get student attendance summary with tally
   * @param {String} studentId
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Object>}
   */
  async getStudentSummaryWithTally(studentId, startDate, endDate) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
    const end = endDate ? new Date(endDate) : new Date();
    
    const items = await this.Model.find({
      studentId,
      date: { $gte: start, $lte: end }
    });
    
    const tally = { Present: 0, Late: 0, Absent: 0, 'Early Leave': 0 };
    items.forEach(i => {
      tally[i.status] = (tally[i.status] || 0) + 1;
    });
    
    const total = items.length || 1;
    const percentage = Math.round(((tally['Present'] + tally['Late']) / total) * 100);
    
    return {
      tally,
      percentage,
      totalClasses: items.length
    };
  }

  /**
   * Get daily report for admin
   * @param {Date} date
   * @returns {Promise<Array>}
   */
  async getDailyReport(date) {
    const d = date ? new Date(date) : new Date();
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59));
    
    return await this.Model.find({
      date: { $gte: start, $lte: end }
    }).sort({ 'studentRef.studentName': 1 });
  }

  /**
   * Get attendance summary stats
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Object>}
   */
  async getAdminSummary(startDate, endDate) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
    const end = endDate ? new Date(endDate) : new Date();
    
    // Set time to start and end of day for proper date comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    // Group by date and status to get daily summaries
    const pipeline = [
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$date' }
            },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ];
    
    const grouped = await this.Model.aggregate(pipeline);
    
    // Convert to daily format expected by frontend
    const dailyMap = new Map();
    
    grouped.forEach(item => {
      const date = item._id.date;
      const status = item._id.status;
      const count = item.count;
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date: date,
          present: 0,
          absent: 0,
          late: 0,
          earlyLeave: 0,
          total: 0
        });
      }
      
      const daily = dailyMap.get(date);
      daily.total += count;
      
      if (status === 'Present') {
        daily.present = count;
      } else if (status === 'Absent') {
        daily.absent = count;
      } else if (status === 'Late') {
        daily.late = count;
      } else if (status === 'Early Leave') {
        daily.earlyLeave = count;
      }
    });
    
    // Convert map to array and calculate percentages
    const summary = Array.from(dailyMap.values()).map(day => ({
      date: day.date,
      present: day.present + day.late, // Count late as present
      absent: day.absent,
      total: day.total,
      percentage: day.total > 0 ? Math.round(((day.present + day.late) / day.total) * 100) : 0
    }));
    
    return summary;
  }

  /**
   * Get entry logs
   * @param {Object} query - Filter query
   * @returns {Promise<Array>}
   */
  async getEntryLogs(query) {
    const q = {};
    if (query.studentId) q.studentId = query.studentId;
    if (query.date) {
      const d = new Date(query.date);
      const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
      const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59));
      q.date = { $gte: start, $lte: end };
    }
    
    return await this.Model.find(q).select('studentRef className date entryLogs');
  }

  /**
   * Get occupancy data by class/room
   * @param {Date} date
   * @returns {Promise<Array>}
   */
  async getOccupancy(date) {
    const d = date ? new Date(date) : new Date();
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59));
    
    const pipeline = [
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { className: '$className', room: '$room' },
          present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } },
          earlyLeave: { $sum: { $cond: [{ $eq: ['$status', 'Early Leave'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          className: '$_id.className',
          room: '$_id.room',
          present: 1,
          late: 1,
          absent: 1,
          earlyLeave: 1,
          total: 1
        }
      },
      { $sort: { className: 1, room: 1 } }
    ];
    
    const data = await this.Model.aggregate(pipeline);
    
    // Attach capacity from timetable
    const dayOfWeek = d.getUTCDay();
    const withCap = [];
    
    for (const row of data) {
      let capacity;
      try {
        const t = await Timetable.find({
          className: row.className,
          room: row.room,
          dayOfWeek
        }).sort({ capacity: -1 }).limit(1);
        
        if (t && t[0] && typeof t[0].capacity === 'number') {
          capacity = t[0].capacity;
        }
      } catch (error) {
        // Ignore capacity lookup errors
      }
      withCap.push({ ...row, capacity });
    }
    
    return withCap;
  }

  /**
   * Get attendance records for export
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Array>}
   */
  async getRecordsForExport(startDate, endDate) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
    const end = endDate ? new Date(endDate) : new Date();
    
    return await this.Model.find({
      date: { $gte: start, $lte: end }
    }).sort({ date: 1, className: 1 });
  }

  /**
   * Submit correction request
   * @param {String} studentId
   * @param {Date} date
   * @param {String} className
   * @param {String} reason
   * @returns {Promise<Object>}
   */
  async submitCorrectionRequest(studentId, date, className, reason) {
    const record = await this.Model.findOne({
      studentId,
      date: new Date(date),
      className
    });
    
    if (!record) {
      throw { status: 404, message: 'Attendance record not found' };
    }
    
    record.correctionRequests.push({ reason });
    await record.save();
    
    return record.correctionRequests[record.correctionRequests.length - 1];
  }

  /**
   * Review correction request
   * @param {String} recordId
   * @param {Number} index
   * @param {String} status
   * @param {String} adminNotes
   * @returns {Promise<Object>}
   */
  async reviewCorrectionRequest(recordId, index, status, adminNotes) {
    const record = await this.Model.findById(recordId);
    
    if (!record) {
      throw { status: 404, message: 'Attendance record not found' };
    }
    
    if (index == null || !record.correctionRequests[index]) {
      throw { status: 400, message: 'Invalid correction request index' };
    }
    
    record.correctionRequests[index].status = status || record.correctionRequests[index].status;
    record.correctionRequests[index].adminNotes = adminNotes;
    await record.save();
    
    return record.correctionRequests[index];
  }

  /**
   * Get student daily attendance (deprecated - use getStudentDaily)
   * @param {String} studentId
   * @param {Date} date
   * @returns {Promise<Array>}
   */
  async getStudentDailyAttendance(studentId, date) {
    return this.getStudentDaily(studentId, date);
  }

  /**
   * Get student attendance summary (deprecated - use getStudentSummaryWithTally)
   * @param {String} studentId
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Object>}
   */
  async getStudentSummary(studentId, startDate, endDate) {
    return this.getStudentSummaryWithTally(studentId, startDate, endDate);
  }

  /**
   * Get admin daily report (deprecated - use getDailyReport)
   * @param {Date} date
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async getAdminDailyReport(date, filters = {}) {
    return this.getDailyReport(date);
  }

  /**
   * Get attendance statistics (deprecated - use getAdminSummary)
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Object>}
   */
  async getStatistics(startDate, endDate) {
    return this.getAdminSummary(startDate, endDate);
  }
}

module.exports = new AttendanceService();
