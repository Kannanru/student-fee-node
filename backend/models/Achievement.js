// backend/models/Achievement.js
const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Achievement title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Achievement description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  imageUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvalDate: {
    type: Date,
    default: null
  },
  rejectionDate: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for performance
achievementSchema.index({ studentId: 1, status: 1 });
achievementSchema.index({ status: 1, createdAt: -1 });

// Virtual for populated student name
achievementSchema.virtual('studentName', {
  ref: 'Student',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Achievement', achievementSchema);
