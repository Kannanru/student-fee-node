/**
 * StudentBill Model
 * 
 * Replaces the old Fee.js model with improved structure:
 * - Links to FeePlan with version locking
 * - Head-wise fee breakdown with tax details
 * - Payment tracking with partial payment support
 * - Overdue calculation and penalty tracking
 * - NRI USD amount tracking
 */

const mongoose = require('mongoose');

const studentBillSchema = new mongoose.Schema({
  // Bill Identification
  billNumber: {
    type: String,
    required: [true, 'Bill number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
    comment: 'Unique bill number e.g., BILL-2025-00123'
  },

  // Student Information
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required'],
    index: true
  },
  studentName: {
    type: String,
    trim: true,
    comment: 'Cached student name for reporting'
  },
  registerNumber: {
    type: String,
    trim: true,
    index: true,
    comment: 'Cached register number for quick lookup'
  },

  // Academic Context
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    index: true,
    comment: 'e.g., 2025-2026'
  },
  program: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    index: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    index: true
  },
  quota: {
    type: String,
    required: true,
    enum: ['puducherry-ut', 'all-india', 'nri', 'self-sustaining'],
    index: true
  },

  // Fee Plan Reference (Version Locked)
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeePlan',
    required: [true, 'Fee plan is required'],
    index: true,
    comment: 'Reference to the fee plan (version locked at bill creation)'
  },
  planCode: {
    type: String,
    required: true,
    comment: 'Cached plan code for reporting'
  },
  planVersion: {
    type: Number,
    required: true,
    comment: 'Plan version at the time of bill creation (version lock)'
  },

  // Fee Breakdown
  heads: [{
    headId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeHead',
      required: true
    },
    headCode: {
      type: String,
      required: true,
      comment: 'Cached fee head code'
    },
    headName: {
      type: String,
      required: true,
      comment: 'Cached fee head name'
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      comment: 'Base amount in INR'
    },
    amountUSD: {
      type: Number,
      min: 0,
      default: 0,
      comment: 'Amount in USD for NRI students'
    },
    taxPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    taxAmount: {
      type: Number,
      min: 0,
      default: 0,
      comment: 'Calculated tax amount'
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      comment: 'amount + taxAmount'
    },
    paidAmount: {
      type: Number,
      min: 0,
      default: 0,
      comment: 'Total paid against this head'
    },
    balanceAmount: {
      type: Number,
      min: 0,
      default: 0,
      comment: 'Remaining balance for this head'
    }
  }],

  // Bill Amounts (INR)
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    comment: 'Total bill amount including all taxes'
  },
  paidAmount: {
    type: Number,
    min: 0,
    default: 0,
    index: true,
    comment: 'Total amount paid so far'
  },
  balanceAmount: {
    type: Number,
    min: 0,
    default: 0,
    index: true,
    comment: 'Outstanding balance'
  },

  // USD Amounts (for NRI students)
  totalAmountUSD: {
    type: Number,
    min: 0,
    default: 0,
    comment: 'Total amount in USD for NRI quota'
  },
  paidAmountUSD: {
    type: Number,
    min: 0,
    default: 0,
    comment: 'Total paid in USD'
  },
  balanceAmountUSD: {
    type: Number,
    min: 0,
    default: 0,
    comment: 'Balance in USD'
  },

  // Due Date & Penalty
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    index: true
  },
  isOverdue: {
    type: Boolean,
    default: false,
    index: true
  },
  daysOverdue: {
    type: Number,
    default: 0,
    min: 0,
    comment: 'Number of days overdue'
  },
  penaltyAmount: {
    type: Number,
    min: 0,
    default: 0,
    comment: 'Late payment penalty'
  },

  // Bill Status
  status: {
    type: String,
    enum: ['pending', 'partially-paid', 'paid', 'overdue', 'waived', 'cancelled'],
    default: 'pending',
    required: true,
    index: true
  },

  // Payment Tracking
  payments: [{
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    receiptNumber: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    amountUSD: {
      type: Number,
      min: 0,
      default: 0
    },
    paymentDate: {
      type: Date,
      required: true
    },
    paymentMode: {
      type: String,
      required: true
    }
  }],

  // Adjustments & Waivers
  adjustments: [{
    adjustmentType: {
      type: String,
      enum: ['waiver', 'discount', 'scholarship', 'penalty', 'refund', 'other'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      comment: 'Positive for discount/waiver, negative for penalty'
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true
    }
  }],

  // Dates
  billedDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
    comment: 'Date when bill was generated'
  },
  lastPaymentDate: {
    type: Date,
    comment: 'Date of last payment received'
  },
  paidInFullDate: {
    type: Date,
    comment: 'Date when bill was paid in full'
  },

  // Metadata
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    comment: 'Admin who generated this bill'
  },
  notes: {
    type: String,
    trim: true,
    comment: 'Internal notes about this bill'
  }
}, {
  timestamps: true,
  collection: 'student_bills'
});

// Compound indexes for efficient queries
studentBillSchema.index({ studentId: 1, academicYear: 1, semester: 1 });
studentBillSchema.index({ status: 1, dueDate: 1 });
studentBillSchema.index({ academicYear: 1, quota: 1, status: 1 });
studentBillSchema.index({ department: 1, year: 1, semester: 1 });
studentBillSchema.index({ isOverdue: 1, daysOverdue: -1 });

// Pre-save middleware to calculate balances and overdue status
studentBillSchema.pre('save', function(next) {
  // Calculate balance for each head
  if (this.isModified('heads') || this.isModified('payments')) {
    this.heads.forEach(head => {
      head.balanceAmount = head.totalAmount - head.paidAmount;
    });
  }

  // Calculate overall balance
  if (this.isModified('paidAmount') || this.isModified('totalAmount')) {
    this.balanceAmount = this.totalAmount - this.paidAmount;
    this.balanceAmountUSD = this.totalAmountUSD - this.paidAmountUSD;
  }

  // Update status based on payment
  if (this.balanceAmount === 0 && this.totalAmount > 0) {
    this.status = 'paid';
    if (!this.paidInFullDate) {
      this.paidInFullDate = new Date();
    }
  } else if (this.paidAmount > 0 && this.balanceAmount > 0) {
    this.status = 'partially-paid';
  } else if (this.balanceAmount > 0 && new Date() > this.dueDate) {
    this.status = 'overdue';
  }

  // Calculate overdue days
  if (this.dueDate && this.balanceAmount > 0) {
    const now = new Date();
    if (now > this.dueDate) {
      this.isOverdue = true;
      const diffTime = Math.abs(now - this.dueDate);
      this.daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
      this.isOverdue = false;
      this.daysOverdue = 0;
    }
  }

  next();
});

// Static method to generate bill number
studentBillSchema.statics.generateBillNumber = async function() {
  const year = new Date().getFullYear();
  const count = await this.countDocuments({ 
    billNumber: new RegExp(`^BILL-${year}-`) 
  });
  const sequence = (count + 1).toString().padStart(5, '0');
  return `BILL-${year}-${sequence}`;
};

// Static method to get student bills
studentBillSchema.statics.getStudentBills = function(studentId, academicYear = null) {
  const query = { studentId };
  if (academicYear) {
    query.academicYear = academicYear;
  }
  return this.find(query)
    .populate('planId')
    .populate('heads.headId')
    .sort({ billedDate: -1 });
};

// Static method to get overdue bills
studentBillSchema.statics.getOverdueBills = function(filters = {}) {
  const query = { 
    status: 'overdue',
    balanceAmount: { $gt: 0 },
    ...filters
  };
  return this.find(query)
    .populate('studentId')
    .sort({ daysOverdue: -1, balanceAmount: -1 });
};

// Static method to get pending bills
studentBillSchema.statics.getPendingBills = function(filters = {}) {
  const query = {
    status: { $in: ['pending', 'partially-paid', 'overdue'] },
    balanceAmount: { $gt: 0 },
    ...filters
  };
  return this.find(query)
    .populate('studentId')
    .sort({ dueDate: 1 });
};

// Instance method to record payment
studentBillSchema.methods.recordPayment = async function(paymentData) {
  const { paymentId, receiptNumber, amount, amountUSD = 0, paymentDate, paymentMode } = paymentData;

  // Add payment to tracking
  this.payments.push({
    paymentId,
    receiptNumber,
    amount,
    amountUSD,
    paymentDate,
    paymentMode
  });

  // Update paid amounts
  this.paidAmount += amount;
  this.paidAmountUSD += amountUSD;
  this.lastPaymentDate = paymentDate;

  // Distribute payment across heads (proportionally)
  if (this.heads.length > 0) {
    const totalDue = this.heads.reduce((sum, head) => sum + head.balanceAmount, 0);
    
    this.heads.forEach(head => {
      if (head.balanceAmount > 0) {
        const proportion = head.balanceAmount / totalDue;
        const headPayment = Math.min(amount * proportion, head.balanceAmount);
        head.paidAmount += headPayment;
      }
    });
  }

  return this.save();
};

// Instance method to add adjustment
studentBillSchema.methods.addAdjustment = async function(adjustmentData) {
  const { adjustmentType, amount, reason, approvedBy, notes } = adjustmentData;

  this.adjustments.push({
    adjustmentType,
    amount,
    reason,
    approvedBy,
    approvedAt: new Date(),
    notes
  });

  // Apply adjustment to balance
  if (adjustmentType === 'waiver' || adjustmentType === 'discount' || adjustmentType === 'scholarship') {
    this.totalAmount -= Math.abs(amount);
  } else if (adjustmentType === 'penalty') {
    this.penaltyAmount += Math.abs(amount);
    this.totalAmount += Math.abs(amount);
  }

  return this.save();
};

// Instance method to calculate penalty based on days overdue
studentBillSchema.methods.calculatePenalty = function(penaltyPerDay = 50) {
  if (this.isOverdue && this.daysOverdue > 0) {
    return this.daysOverdue * penaltyPerDay;
  }
  return 0;
};

// Virtual for payment completion percentage
studentBillSchema.virtual('paymentPercentage').get(function() {
  if (this.totalAmount === 0) return 0;
  return Math.round((this.paidAmount / this.totalAmount) * 100);
});

// Ensure virtuals are included in JSON
studentBillSchema.set('toJSON', { virtuals: true });
studentBillSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('StudentBill', studentBillSchema);
