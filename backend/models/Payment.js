/**
 * Payment Model
 * 
 * Enhanced payment model for fee collection with:
 * - Multiple payment modes (Cash, UPI, Card, Bank Transfer, DD, Cheque)
 * - Receipt generation
 * - Audit trail
 * - Settlement tracking
 * - Mode-specific fields
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Receipt Information
  receiptNumber: {
    type: String,
    required: [true, 'Receipt number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
    comment: 'Unique receipt number e.g., RCP-2025-00123'
  },

  // Student & Bill Information
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required'],
    index: true
  },
  studentName: {
    type: String,
    trim: true,
    comment: 'Cached student name for receipt'
  },
  registerNumber: {
    type: String,
    trim: true,
    index: true,
    comment: 'Student register number'
  },
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentBill',
    required: [true, 'Bill ID is required'],
    index: true,
    comment: 'Reference to the student bill'
  },
  billNumber: {
    type: String,
    trim: true,
    comment: 'Cached bill number'
  },

  // Payment Amount
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative'],
    index: true
  },
  amountUSD: {
    type: Number,
    min: 0,
    default: 0,
    comment: 'Amount in USD for NRI payments'
  },
  fineAmount: {
    type: Number,
    min: 0,
    default: 0,
    comment: 'Fine amount charged for late payment'
  },
  daysDelayed: {
    type: Number,
    min: 0,
    default: 0,
    comment: 'Number of days payment was delayed after due date'
  },
  finePerDay: {
    type: Number,
    min: 0,
    default: 0,
    comment: 'Fine amount per day that was applied'
  },
  totalAmountWithFine: {
    type: Number,
    min: 0,
    default: 0,
    comment: 'Total amount including fine (amount + fineAmount)'
  },
  currency: {
    type: String,
    enum: ['INR', 'USD'],
    default: 'INR',
    required: true
  },

  // Payment Mode & Details
  paymentMode: {
    type: String,
    required: [true, 'Payment mode is required'],
    enum: ['cash', 'upi', 'card', 'bank-transfer', 'dd', 'cheque', 'online'],
    index: true
  },

  // Cash - No additional fields needed
  
  // UPI Details
  upiDetails: {
    transactionId: {
      type: String,
      trim: true,
      comment: 'UPI transaction reference ID'
    },
    upiId: {
      type: String,
      trim: true,
      lowercase: true,
      comment: 'Payer UPI ID'
    },
    provider: {
      type: String,
      trim: true,
      comment: 'UPI provider (GooglePay, PhonePe, Paytm, etc.)'
    }
  },

  // Card Details
  cardDetails: {
    last4Digits: {
      type: String,
      match: /^\d{4}$/,
      comment: 'Last 4 digits of card number'
    },
    cardType: {
      type: String,
      enum: ['debit', 'credit'],
      comment: 'Card type'
    },
    cardNetwork: {
      type: String,
      enum: ['Visa', 'Mastercard', 'RuPay', 'AmEx'],
      comment: 'Card network'
    },
    bankName: {
      type: String,
      trim: true,
      comment: 'Issuing bank name'
    }
  },

  // Bank Transfer Details
  bankTransferDetails: {
    accountNumber: {
      type: String,
      trim: true,
      comment: 'From account number (last 4 digits)'
    },
    ifscCode: {
      type: String,
      uppercase: true,
      trim: true,
      comment: 'IFSC code of sender bank'
    },
    bankName: {
      type: String,
      trim: true,
      comment: 'Sender bank name'
    },
    transferDate: {
      type: Date,
      comment: 'Date of bank transfer'
    },
    utrNumber: {
      type: String,
      trim: true,
      comment: 'UTR/Reference number'
    }
  },

  // Demand Draft Details
  ddDetails: {
    ddNumber: {
      type: String,
      trim: true,
      comment: 'Demand draft number'
    },
    ddDate: {
      type: Date,
      comment: 'Date of DD issue'
    },
    bankName: {
      type: String,
      trim: true,
      comment: 'Bank name on DD'
    },
    branchName: {
      type: String,
      trim: true,
      comment: 'Branch name'
    }
  },

  // Cheque Details
  chequeDetails: {
    chequeNumber: {
      type: String,
      trim: true,
      comment: 'Cheque number'
    },
    chequeDate: {
      type: Date,
      comment: 'Date on cheque'
    },
    bankName: {
      type: String,
      trim: true,
      comment: 'Bank name'
    },
    branchName: {
      type: String,
      trim: true,
      comment: 'Branch name'
    },
    clearanceStatus: {
      type: String,
      enum: ['pending', 'cleared', 'bounced'],
      default: 'pending',
      comment: 'Cheque clearance status'
    },
    clearanceDate: {
      type: Date,
      comment: 'Date when cheque cleared'
    }
  },

  // Online/Gateway Payment
  gatewayDetails: {
    gatewayName: {
      type: String,
      enum: ['razorpay', 'hdfc', 'paytm', 'other'],
      comment: 'Payment gateway used'
    },
    gatewayTransactionId: {
      type: String,
      trim: true,
      comment: 'Gateway transaction ID'
    },
    orderId: {
      type: String,
      trim: true,
      comment: 'Gateway order ID'
    },
    gatewayFee: {
      type: Number,
      min: 0,
      default: 0,
      comment: 'Gateway transaction fee'
    }
  },

  // Fee Heads Paid (breakdown)
  headsPaid: [{
    headId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeHead'
    },
    headCode: {
      type: String,
      required: true
    },
    headName: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  }],

  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'cancelled', 'refunded'],
    default: 'confirmed',
    required: true,
    index: true
  },

  // Dates
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
    comment: 'Date when payment was received'
  },
  confirmedAt: {
    type: Date,
    comment: 'Date when payment was confirmed'
  },

  // Collection Details
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Collector information is required'],
    comment: 'Admin/Accountant who collected payment'
  },
  collectedByName: {
    type: String,
    trim: true,
    comment: 'Cached collector name'
  },
  collectionLocation: {
    type: String,
    trim: true,
    default: 'Fee Counter',
    comment: 'Location where payment was collected'
  },

  // Settlement & Accounting
  settlementAmount: {
    type: Number,
    min: 0,
    comment: 'Net amount after deducting fees'
  },
  transactionFee: {
    type: Number,
    min: 0,
    default: 0,
    comment: 'Transaction processing fee'
  },
  settledOn: {
    type: Date,
    comment: 'Date when amount was settled to bank'
  },
  settlementRef: {
    type: String,
    trim: true,
    comment: 'Settlement reference number'
  },

  // Refund Information
  refundDetails: {
    refunded: {
      type: Boolean,
      default: false
    },
    refundAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    refundDate: {
      type: Date
    },
    refundReason: {
      type: String,
      trim: true
    },
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    refundRef: {
      type: String,
      trim: true,
      comment: 'Refund transaction reference'
    }
  },

  // Receipt Generation
  receiptGenerated: {
    type: Boolean,
    default: false
  },
  receiptGeneratedAt: {
    type: Date
  },
  receiptPDF: {
    type: String,
    comment: 'URL/path to generated PDF receipt'
  },
  receiptPrinted: {
    type: Boolean,
    default: false
  },

  // Audit Trail
  auditLog: [{
    action: {
      type: String,
      enum: ['created', 'confirmed', 'cancelled', 'refunded', 'printed', 'modified'],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    details: {
      type: String,
      trim: true
    },
    ipAddress: {
      type: String,
      trim: true
    }
  }],

  // Additional Information
  remarks: {
    type: String,
    trim: true,
    comment: 'Internal remarks about the payment'
  },
  studentRemarks: {
    type: String,
    trim: true,
    comment: 'Remarks from student (if any)'
  },

  // Academic Context
  academicYear: {
    type: String,
    required: true,
    index: true
  },
  semester: {
    type: Number,
    min: 1
  },
  quota: {
    type: String,
    enum: ['puducherry-ut', 'all-india', 'nri', 'self-sustaining']
  },

  // Legacy fields (for backward compatibility)
  invoiceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Invoice'
  },
  installmentId: { 
    type: String 
  },
  method: { 
    type: String, 
    enum: ['upi', 'card', 'netbanking', 'cash']
  },
  pgRef: { 
    type: String 
  },
  ts: { 
    type: Date 
  },
  fees: { 
    type: Number 
  },
  netSettlement: { 
    type: Number 
  }
}, { 
  timestamps: true,
  collection: 'payments'
});

// Indexes for efficient queries
paymentSchema.index({ studentId: 1, paymentDate: -1 });
paymentSchema.index({ billId: 1, status: 1 });
paymentSchema.index({ paymentMode: 1, paymentDate: -1 });
paymentSchema.index({ collectedBy: 1, paymentDate: -1 });
paymentSchema.index({ academicYear: 1, status: 1 });
paymentSchema.index({ quota: 1, paymentDate: -1 });
paymentSchema.index({ 'upiDetails.transactionId': 1 }, { sparse: true });
paymentSchema.index({ 'chequeDetails.chequeNumber': 1 }, { sparse: true });

// Static method to generate receipt number
paymentSchema.statics.generateReceiptNumber = async function() {
  const year = new Date().getFullYear();
  const count = await this.countDocuments({ 
    receiptNumber: new RegExp(`^RCP-${year}-`) 
  });
  const sequence = (count + 1).toString().padStart(5, '0');
  return `RCP-${year}-${sequence}`;
};

// Static method to get daily collection
paymentSchema.statics.getDailyCollection = function(date, filters = {}) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    paymentDate: { $gte: startOfDay, $lte: endOfDay },
    status: 'confirmed',
    ...filters
  })
  .populate('studentId')
  .populate('collectedBy')
  .sort({ paymentDate: -1 });
};

// Static method to get payments by mode
paymentSchema.statics.getByPaymentMode = function(mode, startDate, endDate) {
  const query = {
    paymentMode: mode,
    status: 'confirmed'
  };
  
  if (startDate && endDate) {
    query.paymentDate = { $gte: startDate, $lte: endDate };
  }
  
  return this.find(query).sort({ paymentDate: -1 });
};

// Instance method to add audit log entry
paymentSchema.methods.addAuditLog = function(action, performedBy, details, ipAddress) {
  this.auditLog.push({
    action,
    performedBy,
    performedAt: new Date(),
    details,
    ipAddress
  });
  return this.save();
};

// Instance method to mark as refunded
paymentSchema.methods.markAsRefunded = async function(refundData) {
  const { refundAmount, refundReason, refundedBy, refundRef } = refundData;
  
  this.status = 'refunded';
  this.refundDetails = {
    refunded: true,
    refundAmount,
    refundDate: new Date(),
    refundReason,
    refundedBy,
    refundRef
  };
  
  await this.addAuditLog('refunded', refundedBy, `Refunded ₹${refundAmount}: ${refundReason}`);
  
  return this.save();
};

// Instance method to generate receipt
paymentSchema.methods.generateReceipt = async function() {
  // This will be implemented with PDF generation
  this.receiptGenerated = true;
  this.receiptGeneratedAt = new Date();
  
  // PDF generation logic would go here
  // this.receiptPDF = await generatePDF(this);
  
  return this.save();
};

// Pre-save middleware to calculate settlement amount
paymentSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('transactionFee')) {
    this.settlementAmount = this.amount - (this.transactionFee || 0);
  }
  
  if (this.isNew) {
    this.auditLog.push({
      action: 'created',
      performedBy: this.collectedBy,
      performedAt: new Date(),
      details: `Payment of ₹${this.amount} via ${this.paymentMode}`
    });
  }
  
  next();
});

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount.toLocaleString('en-IN')}`;
});

// Virtual for payment method display
paymentSchema.virtual('paymentMethodDisplay').get(function() {
  const modeMap = {
    'cash': 'Cash',
    'upi': 'UPI',
    'card': 'Card',
    'bank-transfer': 'Bank Transfer',
    'dd': 'Demand Draft',
    'cheque': 'Cheque',
    'online': 'Online Payment'
  };
  return modeMap[this.paymentMode] || this.paymentMode;
});

// Ensure virtuals are included in JSON
paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Payment', paymentSchema);

