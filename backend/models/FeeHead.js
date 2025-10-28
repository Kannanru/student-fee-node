// models/FeeHead.js
const mongoose = require('mongoose');

const feeHeadSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Fee head name is required'],
    trim: true
  },
  code: { 
    type: String, 
    required: [true, 'Fee head code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['academic', 'hostel', 'miscellaneous'],
      message: 'Category must be academic, hostel, or miscellaneous'
    },
    default: 'academic',
    index: true
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    enum: {
      values: ['one-time', 'annual', 'semester'],
      message: 'Frequency must be one-time, annual, or semester'
    },
    default: 'semester'
  },
  isRefundable: {
    type: Boolean,
    default: false,
    comment: 'Whether this fee can be refunded (e.g., caution deposit)'
  },
  defaultAmount: {
    type: Number,
    min: [0, 'Default amount cannot be negative'],
    default: 0,
    comment: 'Default/suggested amount for this fee head'
  },
  description: {
    type: String,
    trim: true,
    comment: 'Detailed description of the fee head'
  },
  displayOrder: {
    type: Number,
    default: 0,
    comment: 'Sort order for display (lower numbers appear first)'
  },
  taxability: { 
    type: Boolean, 
    default: false,
    comment: 'Whether this fee is taxable (GST applicable)'
  },
  taxPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
    comment: 'Tax percentage if taxable (e.g., 18 for 18% GST)'
  },
  glCode: { 
    type: String,
    trim: true,
    comment: 'General Ledger code for accounting integration'
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active',
    index: true
  }
}, { 
  timestamps: true,
  collection: 'fee_heads'
});

// Compound indexes for common queries
feeHeadSchema.index({ status: 1, category: 1, displayOrder: 1 });
feeHeadSchema.index({ status: 1, frequency: 1 });

// Static method to get active fee heads
feeHeadSchema.statics.getActiveFeeHeads = function(category = null) {
  const query = { status: 'active' };
  if (category) {
    query.category = category;
  }
  return this.find(query).sort({ displayOrder: 1, name: 1 });
};

// Static method to get fee heads by category
feeHeadSchema.statics.getByCategory = function(category) {
  return this.find({ status: 'active', category }).sort({ displayOrder: 1 });
};

// Static method to get refundable fee heads
feeHeadSchema.statics.getRefundableFeeHeads = function() {
  return this.find({ status: 'active', isRefundable: true }).sort({ displayOrder: 1 });
};

// Instance method to calculate tax amount
feeHeadSchema.methods.calculateTax = function(amount) {
  if (!this.taxability || this.taxPercentage <= 0) {
    return 0;
  }
  return (amount * this.taxPercentage) / 100;
};

// Instance method to get total amount with tax
feeHeadSchema.methods.getAmountWithTax = function(baseAmount) {
  const taxAmount = this.calculateTax(baseAmount);
  return {
    baseAmount,
    taxAmount,
    totalAmount: baseAmount + taxAmount
  };
};

// Virtual for formatted name with code
feeHeadSchema.virtual('formattedName').get(function() {
  return `${this.name} (${this.code})`;
});

// Ensure virtuals are included in JSON
feeHeadSchema.set('toJSON', { virtuals: true });
feeHeadSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FeeHead', feeHeadSchema);
