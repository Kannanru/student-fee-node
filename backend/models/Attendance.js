const mongoose = require('mongoose');

const correctionRequestSchema = new mongoose.Schema({
  reason: { type: String, trim: true, maxlength: 500, required: [true, 'Reason is required'] },
  requestedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNotes: { type: String, trim: true, maxlength: 500 }
}, { _id: false });

const entryLogSchema = new mongoose.Schema({
  type: { type: String, enum: ['in', 'out'], required: true },
  timestamp: { type: Date, required: true },
  cameraId: { type: String, trim: true },
  location: { type: String, trim: true },
  aiConfidence: { type: Number, min: 0, max: 1 }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  studentRef: {
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    courseGroup: { type: String, required: true },
    academicYear: { type: String, required: true }
  },
  className: { type: String, required: [true, 'Class name is required'], trim: true, maxlength: 100 },
  timetableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Timetable' },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSession', index: true },
  hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', index: true },
  room: { type: String, trim: true, maxlength: 50 },
  cameraId: { type: String, trim: true, maxlength: 100 },
  date: { type: Date, required: [true, 'Date is required'] },
  classStartTime: { type: Date, required: [true, 'Class start time is required'] },
  classEndTime: { type: Date, required: [true, 'Class end time is required'] },
  timeIn: { type: Date },
  timeOut: { type: Date },
  duration: { type: Number, default: 0 }, // in minutes - actual presence duration
  status: { type: String, enum: ['Present', 'Late', 'Absent', 'Early Leave'], required: true },
  lateMinutes: { type: Number, min: 0, default: 0 },
  source: { type: String, enum: ['Auto', 'Manual', 'Override'], default: 'Auto' },
  reasonForAbsence: { type: String, trim: true, maxlength: 200 },
  aiConfidence: { type: Number, min: 0, max: 1 },
  entryLogs: [entryLogSchema],
  correctionRequests: [correctionRequestSchema],
  manualOverride: {
    overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    overriddenAt: { type: Date },
    previousStatus: { type: String },
    reason: { type: String, trim: true, maxlength: 500 },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    approvedAt: { type: Date }
  },
  flags: {
    late: { type: Boolean, default: false },
    absent: { type: Boolean, default: false },
    earlyLeave: { type: Boolean, default: false }
  }
}, { timestamps: true });

attendanceSchema.index({ studentId: 1, date: 1, className: 1 }, { unique: true });
attendanceSchema.index({ date: 1, className: 1 });

attendanceSchema.pre('validate', function(next) {
  // Validate time ordering
  if (this.classEndTime <= this.classStartTime) {
    return next(new Error('classEndTime must be after classStartTime'));
  }
  if (this.timeIn && this.timeIn < this.classStartTime && (this.status === 'Present' || this.status === 'Late')) {
    // Allow early entry; no error
  }
  if (this.timeOut && this.timeIn && this.timeOut < this.timeIn) {
    return next(new Error('timeOut cannot be before timeIn'));
  }
  
  // Calculate duration if timeIn and timeOut are available
  if (this.timeIn && this.timeOut) {
    this.duration = Math.max(0, Math.round((this.timeOut - this.timeIn) / (1000 * 60)));
  } else if (this.timeIn) {
    // If only timeIn, calculate duration till classEndTime or now
    const endTime = this.timeOut || (new Date() < this.classEndTime ? new Date() : this.classEndTime);
    this.duration = Math.max(0, Math.round((endTime - this.timeIn) / (1000 * 60)));
  }
  
  // Compute status by 10-minute late rule if timeIn provided
  if (this.timeIn) {
    const diffMin = Math.max(0, Math.round((this.timeIn - this.classStartTime) / 60000));
    this.lateMinutes = diffMin;
    this.flags.late = diffMin > 0;
    this.status = diffMin > 10 ? 'Late' : 'Present';
  } else if (!this.timeIn && this.status !== 'Early Leave') {
    // No timeIn -> treat as Absent unless explicitly marked otherwise
    this.status = 'Absent';
    this.flags.absent = true;
  }
  if (this.status === 'Early Leave' && this.timeOut && this.classEndTime) {
    this.flags.earlyLeave = this.timeOut < this.classEndTime;
  }
  if (this.status === 'Absent') {
    this.flags.absent = true;
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
