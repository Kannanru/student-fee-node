const mongoose = require('mongoose');

/**
 * AttendanceEvent Model
 * Stores raw camera events (IN/OUT) with confidence and spoof detection
 */
const attendanceEventSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required'],
    index: true
  },
  studentRegNo: {
    type: String,
    required: [true, 'Student registration number is required'],
    trim: true,
    index: true
  },
  hallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hall',
    required: [true, 'Hall ID is required'],
    index: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassSession',
    index: true
  },
  timestamp: {
    type: Date,
    required: [true, 'Timestamp is required'],
    index: true
  },
  direction: {
    type: String,
    enum: ['IN', 'OUT'],
    required: [true, 'Direction is required']
  },
  confidence: {
    type: Number,
    required: [true, 'Confidence score is required'],
    min: 0,
    max: 1
  },
  spoofScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  deviceId: {
    type: String,
    trim: true,
    maxlength: 100
  },
  cameraId: {
    type: String,
    required: [true, 'Camera ID is required'],
    trim: true,
    maxlength: 100,
    index: true
  },
  imageUrl: {
    type: String,
    trim: true,
    maxlength: 500
  },
  processingStatus: {
    type: String,
    enum: ['Pending', 'Processed', 'Rejected', 'Exception'],
    default: 'Pending',
    index: true
  },
  rejectionReason: {
    type: String,
    enum: [
      'Low Confidence',
      'Spoof Detected',
      'No Matching Session',
      'Student Not Found',
      'Duplicate Event',
      'Invalid Timestamp',
      'Other'
    ]
  },
  attendanceRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance'
  },
  metadata: {
    faceQuality: Number,
    maskDetected: Boolean,
    glassesDetected: Boolean,
    headPose: {
      yaw: Number,
      pitch: Number,
      roll: Number
    },
    temperature: Number, // If thermal camera
    rawData: mongoose.Schema.Types.Mixed
  },
  isProcessed: {
    type: Boolean,
    default: false,
    index: true
  },
  processedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, { 
  timestamps: true 
});

// Compound indexes for efficient queries
attendanceEventSchema.index({ studentId: 1, timestamp: 1 });
attendanceEventSchema.index({ hallId: 1, timestamp: 1 });
attendanceEventSchema.index({ sessionId: 1, studentId: 1 });
attendanceEventSchema.index({ processingStatus: 1, isProcessed: 1 });
attendanceEventSchema.index({ timestamp: 1, direction: 1 });

// Virtual for event age
attendanceEventSchema.virtual('eventAge').get(function() {
  return Date.now() - this.timestamp.getTime();
});

// Method to mark as processed
attendanceEventSchema.methods.markProcessed = function(attendanceRecordId) {
  this.isProcessed = true;
  this.processingStatus = 'Processed';
  this.processedAt = new Date();
  if (attendanceRecordId) {
    this.attendanceRecordId = attendanceRecordId;
  }
  return this.save();
};

// Method to mark as rejected
attendanceEventSchema.methods.markRejected = function(reason) {
  this.isProcessed = true;
  this.processingStatus = 'Rejected';
  this.rejectionReason = reason;
  this.processedAt = new Date();
  return this.save();
};

// Static method to get unprocessed events
attendanceEventSchema.statics.getUnprocessedEvents = function(limit = 100) {
  return this.find({ isProcessed: false })
    .sort({ timestamp: 1 })
    .limit(limit)
    .populate('studentId', 'firstName lastName studentId')
    .populate('hallId', 'hallId hallName');
};

module.exports = mongoose.model('AttendanceEvent', attendanceEventSchema);
