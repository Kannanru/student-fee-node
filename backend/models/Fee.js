const mongoose = require('mongoose');

// Fee Structure Schema
const feeSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: [true, 'Student ID is required'] 
  },
  academicYear: { 
    type: String, 
    required: [true, 'Academic year is required'],
    validate: {
      validator: function(v) {
        return /^[0-9]{4}-[0-9]{4}$/.test(v);
      },
      message: 'Academic year format should be like 2025-2026'
    }
  },
  semester: { 
    type: String, 
    required: [true, 'Semester is required'],
    validate: {
      validator: function(v) {
        return /^(1|2|3|4|5|6|7|8|9|10)$/.test(v);
      },
      message: 'Semester must be between 1 and 10'
    }
  },
  
  // Fee Breakdown
  feeBreakdown: {
    tuitionFee: { 
      type: Number, 
      required: [true, 'Tuition fee is required'], 
      min: [0, 'Tuition fee cannot be negative'] 
    },
    semesterFee: { 
      type: Number, 
      required: [true, 'Semester fee is required'], 
      min: [0, 'Semester fee cannot be negative'] 
    },
    hostelFee: { 
      type: Number, 
      default: 0, 
      min: [0, 'Hostel fee cannot be negative'] 
    },
    libraryFee: { 
      type: Number, 
      default: 0, 
      min: [0, 'Library fee cannot be negative'] 
    },
    labFee: { 
      type: Number, 
      default: 0, 
      min: [0, 'Lab fee cannot be negative'] 
    },
    otherFees: { 
      type: Number, 
      default: 0, 
      min: [0, 'Other fees cannot be negative'] 
    }
  },
  
  totalAmount: { 
    type: Number, 
    required: [true, 'Total amount is required'], 
    min: [0, 'Total amount cannot be negative'] 
  },
  paidAmount: { 
    type: Number, 
    default: 0, 
    min: [0, 'Paid amount cannot be negative'] 
  },
  dueAmount: { 
    type: Number, 
    required: [true, 'Due amount is required'], 
    min: [0, 'Due amount cannot be negative'] 
  },
  
  // Due Date and Penalty
  dueDate: { 
    type: Date, 
    required: [true, 'Due date is required'] 
  },
  isOverdue: { 
    type: Boolean, 
    default: false 
  },
  penaltyAmount: { 
    type: Number, 
    default: 0, 
    min: [0, 'Penalty amount cannot be negative'] 
  },
  penaltyAppliedDate: { 
    type: Date 
  },
  
  // Payment History
  paymentHistory: [{
    paymentDate: { 
      type: Date, 
      required: [true, 'Payment date is required'] 
    },
    amountPaid: { 
      type: Number, 
      required: [true, 'Amount paid is required'], 
      min: [1, 'Amount paid must be greater than 0'] 
    },
    paymentMode: { 
      type: String, 
      required: [true, 'Payment mode is required'],
      enum: {
        values: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'Bank Transfer', 'Cheque', 'DD'],
        message: 'Invalid payment mode'
      }
    },
    transactionId: { 
      type: String, 
      required: [true, 'Transaction ID is required'], 
      unique: true,
      trim: true
    },
    receiptNumber: { 
      type: String, 
      required: [true, 'Receipt number is required'], 
      unique: true,
      trim: true
    },
    paymentStatus: { 
      type: String, 
      required: [true, 'Payment status is required'],
      enum: {
        values: ['Successful', 'Pending', 'Failed', 'Cancelled'],
        message: 'Payment status must be Successful, Pending, Failed, or Cancelled'
      }
    },
    balanceAfterPayment: { 
      type: Number, 
      required: [true, 'Balance after payment is required'], 
      min: [0, 'Balance cannot be negative'] 
    },
    paymentGateway: { 
      type: String, 
      trim: true 
    },
    gatewayTransactionId: { 
      type: String, 
      trim: true 
    }
  }],
  
  status: { 
    type: String, 
    enum: {
      values: ['Pending', 'Partial', 'Paid', 'Overdue'],
      message: 'Status must be Pending, Partial, Paid, or Overdue'
    },
    default: 'Pending' 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

feeSchema.virtual('isCurrentlyOverdue').get(function() {
  return new Date() > this.dueDate && this.dueAmount > 0;
});

feeSchema.pre('save', function(next) {
  const breakdown = this.feeBreakdown;
  this.totalAmount = breakdown.tuitionFee + breakdown.semesterFee + breakdown.hostelFee + 
                    breakdown.libraryFee + breakdown.labFee + breakdown.otherFees;
  if (this.isCurrentlyOverdue && !this.isOverdue) {
    this.isOverdue = true;
    this.penaltyAppliedDate = new Date();
  }
  this.dueAmount = this.totalAmount + this.penaltyAmount - this.paidAmount;
  if (this.dueAmount <= 0) this.status = 'Paid';
  else if (this.paidAmount > 0) this.status = 'Partial';
  else if (this.isCurrentlyOverdue) this.status = 'Overdue';
  else this.status = 'Pending';
  next();
});

feeSchema.index({ studentId: 1, academicYear: 1, semester: 1 });
feeSchema.index({ dueDate: 1 });
feeSchema.index({ status: 1 });

module.exports = mongoose.model('Fee', feeSchema);
