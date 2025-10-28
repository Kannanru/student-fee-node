const mongoose = require('mongoose');

/**
 * ClassSession Model
 * Represents individual class periods mapped to halls and timetables
 */
const classSessionSchema = new mongoose.Schema({
  timetableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable',
    required: [true, 'Timetable reference is required'],
    index: true
  },
  hallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hall',
    required: [true, 'Hall reference is required'],
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Session date is required'],
    index: true
  },
  periodNumber: {
    type: Number,
    required: [true, 'Period number is required'],
    min: 1,
    max: 10
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: 100
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  facultyName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  program: {
    type: String,
    required: [true, 'Program is required'],
    trim: true,
    maxlength: 50
  },
  department: {
    type: String,
    trim: true,
    maxlength: 100
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 1,
    max: 6
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: 1,
    max: 12
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  duration: {
    type: Number, // in minutes
    default: function() {
      if (this.startTime && this.endTime) {
        return Math.round((this.endTime - this.startTime) / (1000 * 60));
      }
      return 0;
    }
  },
  expectedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  totalExpected: {
    type: Number,
    default: 0
  },
  totalPresent: {
    type: Number,
    default: 0
  },
  totalLate: {
    type: Number,
    default: 0
  },
  totalAbsent: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, { 
  timestamps: true 
});

// Compound indexes for efficient queries
classSessionSchema.index({ date: 1, hallId: 1 });
classSessionSchema.index({ date: 1, program: 1, year: 1, semester: 1 });
classSessionSchema.index({ timetableId: 1, date: 1 });
classSessionSchema.index({ status: 1, date: 1 });

// Pre-save validation
classSessionSchema.pre('validate', function(next) {
  if (this.endTime <= this.startTime) {
    return next(new Error('End time must be after start time'));
  }
  next();
});

// Calculate duration before save
classSessionSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  next();
});

module.exports = mongoose.model('ClassSession', classSessionSchema);
