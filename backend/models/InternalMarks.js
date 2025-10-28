const mongoose = require('mongoose');

const internalMarksSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InternalSubject',
    required: true
  },
  academicYear: {
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
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0
  },
  maxMarks: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'F', 'AB'],
    default: null
  },
  remarks: {
    type: String,
    trim: true
  },
  enteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound unique index - one marks entry per student per subject per academic year
internalMarksSchema.index({ studentId: 1, subjectId: 1, academicYear: 1 }, { unique: true });

// Index for faster queries
internalMarksSchema.index({ studentId: 1, academicYear: 1 });
internalMarksSchema.index({ department: 1, year: 1, semester: 1, academicYear: 1 });

// Calculate percentage before saving
internalMarksSchema.pre('save', function(next) {
  if (this.marksObtained != null && this.maxMarks > 0) {
    this.percentage = ((this.marksObtained / this.maxMarks) * 100).toFixed(2);
    
    // Auto-calculate grade
    const percentage = this.percentage;
    if (percentage >= 90) this.grade = 'A+';
    else if (percentage >= 80) this.grade = 'A';
    else if (percentage >= 70) this.grade = 'B+';
    else if (percentage >= 60) this.grade = 'B';
    else if (percentage >= 50) this.grade = 'C';
    else if (percentage >= 40) this.grade = 'D';
    else this.grade = 'F';
  }
  next();
});

module.exports = mongoose.model('InternalMarks', internalMarksSchema);
