const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentRegisterNumber: {
    type: String,
    required: true
  },
  programName: String,
  year: Number,
  section: String,
  
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  numberOfDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  leaveType: {
    type: String,
    enum: ['Sick Leave', 'Medical Leave', 'Personal Leave', 'Emergency Leave', 'Other'],
    default: 'Other'
  },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  appliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  appliedByName: String,
  appliedByRole: {
    type: String,
    enum: ['student', 'admin'],
    default: 'admin'
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedByName: String,
  approvalDate: Date,
  rejectionReason: String,
  
  attachments: [String],
  remarks: String
}, {
  timestamps: true
});

// Index for faster queries
leaveSchema.index({ studentId: 1, startDate: 1, endDate: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

// Method to check if leave overlaps with existing approved leaves
leaveSchema.statics.checkOverlap = async function(studentId, startDate, endDate, excludeId = null) {
  const query = {
    studentId,
    status: 'approved',
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const overlapping = await this.findOne(query);
  return !!overlapping;
};

module.exports = mongoose.model('Leave', leaveSchema);
