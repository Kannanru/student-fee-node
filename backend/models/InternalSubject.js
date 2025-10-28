const mongoose = require('mongoose');

const internalSubjectSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  maxMarks: {
    type: Number,
    required: true,
    default: 100
  },
  passingMarks: {
    type: Number,
    required: true,
    default: 40
  },
  credits: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index to ensure unique subject per department, year, and semester
internalSubjectSchema.index({ subjectCode: 1, department: 1, year: 1, semester: 1 }, { unique: true });

// Index for faster queries
internalSubjectSchema.index({ department: 1, year: 1, semester: 1 });

module.exports = mongoose.model('InternalSubject', internalSubjectSchema);
