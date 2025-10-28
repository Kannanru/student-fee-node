// models/FeePlan.js
const mongoose = require('mongoose');

const feePlanSchema = new mongoose.Schema({
  // Basic Information
  code: {
    type: String,
    required: [true, 'Plan code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
    comment: 'Unique plan code e.g., MBBS-Y1-S1-PU-V1'
  },
  name: { 
    type: String, 
    required: [true, 'Plan name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },

  // Academic Details
  program: { 
    type: String, 
    required: [true, 'Program is required'],
    trim: true,
    index: true,
    comment: 'e.g., MBBS, MD, MS'
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    index: true,
    comment: 'e.g., Medicine, Surgery, Pediatrics'
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 1,
    max: 5,
    index: true
  },
  semester: { 
    type: Number,
    required: [true, 'Semester is required'],
    min: 1,
    max: 10,
    index: true
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    index: true,
    comment: 'e.g., 2025-2026'
  },

  // Quota Information
  quota: {
    type: String,
    required: [true, 'Quota is required'],
    enum: ['puducherry-ut', 'all-india', 'nri', 'self-sustaining'],
    index: true,
    comment: 'Quota type for this plan'
  },
  quotaRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuotaConfig',
    comment: 'Reference to QuotaConfig'
  },

  // Fee Heads & Amounts
  heads: [{
    headId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeHead',
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
      default: 0,
      comment: 'Amount in USD for NRI quota'
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
      default: 0
    },
    totalAmount: {
      type: Number,
      min: 0,
      default: 0,
      comment: 'amount + taxAmount'
    }
  }],

  // Totals
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    comment: 'Total amount in INR (sum of all heads with tax)'
  },
  totalAmountUSD: {
    type: Number,
    min: 0,
    default: 0,
    comment: 'Total amount in USD for NRI quota'
  },

  // Installment Configuration
  mode: { 
    type: String, 
    enum: ['full', '2', '4'], 
    required: true,
    default: 'full',
    comment: 'Payment mode: full upfront, 2 installments, or 4 installments'
  },
  dueDates: [{
    installmentNumber: {
      type: Number,
      required: true,
      min: 1
    },
    dueDate: {
      type: Date,
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
    finePerDay: {
      type: Number,
      min: 0,
      default: 0,
      comment: 'Fine amount charged per day after due date (e.g., ₹5, ₹10, ₹15)'
    },
    description: {
      type: String,
      trim: true,
      comment: 'e.g., First Installment, Second Installment'
    }
  }],

  // Version Control
  version: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  effectiveFrom: {
    type: Date,
    required: true,
    comment: 'Date from which this plan is effective'
  },
  effectiveTo: {
    type: Date,
    comment: 'Date until which this plan is effective'
  },
  supersededBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeePlan',
    comment: 'Reference to the new version that replaces this plan'
  },
  locked: {
    type: Boolean,
    default: false,
    comment: 'Lock plan to prevent modifications after students are assigned'
  },

  // Status & Metadata
  status: { 
    type: String, 
    enum: ['draft', 'active', 'inactive', 'archived'], 
    default: 'draft',
    index: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    comment: 'Admin who approved this plan'
  },
  approvedAt: {
    type: Date,
    comment: 'Date when plan was approved'
  },
  notes: {
    type: String,
    trim: true,
    comment: 'Internal notes about this fee plan'
  }
}, { 
  timestamps: true,
  collection: 'fee_plans'
});

// Compound indexes for efficient queries
feePlanSchema.index({ program: 1, year: 1, semester: 1, quota: 1, status: 1 });
feePlanSchema.index({ academicYear: 1, status: 1 });
feePlanSchema.index({ quota: 1, status: 1 });
feePlanSchema.index({ effectiveFrom: 1, effectiveTo: 1 });
feePlanSchema.index({ version: 1, status: 1 });

// Pre-save middleware to calculate totals
feePlanSchema.pre('save', async function(next) {
  if (this.isModified('heads')) {
    // Calculate total amounts
    let totalINR = 0;
    let totalUSD = 0;

    this.heads.forEach(head => {
      // Calculate tax amount
      head.taxAmount = (head.amount * head.taxPercentage) / 100;
      head.totalAmount = head.amount + head.taxAmount;
      
      // Add to totals
      totalINR += head.totalAmount;
      if (head.amountUSD > 0) {
        totalUSD += head.amountUSD;
      }
    });

    this.totalAmount = totalINR;
    this.totalAmountUSD = totalUSD;
  }

  next();
});

// Static method to get active plans by filters
feePlanSchema.statics.getActivePlans = function(filters = {}) {
  const query = { status: 'active', ...filters };
  return this.find(query)
    .populate('heads.headId')
    .populate('quotaRef')
    .sort({ program: 1, year: 1, semester: 1 });
};

// Static method to get plan by code
feePlanSchema.statics.getByCode = function(code) {
  return this.findOne({ code: code.toUpperCase(), status: 'active' })
    .populate('heads.headId')
    .populate('quotaRef');
};

// Static method to get plans for specific quota
feePlanSchema.statics.getByQuota = function(quota, academicYear = null) {
  const query = { quota, status: 'active' };
  if (academicYear) {
    query.academicYear = academicYear;
  }
  return this.find(query)
    .populate('heads.headId')
    .populate('quotaRef')
    .sort({ program: 1, year: 1, semester: 1 });
};

// Static method to get current version of a plan
feePlanSchema.statics.getCurrentVersion = function(program, year, semester, quota, academicYear) {
  const now = new Date();
  return this.findOne({
    program,
    year,
    semester,
    quota,
    academicYear,
    status: 'active',
    effectiveFrom: { $lte: now },
    $or: [
      { effectiveTo: { $gte: now } },
      { effectiveTo: null }
    ]
  })
  .populate('heads.headId')
  .populate('quotaRef')
  .sort({ version: -1 })
  .limit(1);
};

// Instance method to create new version
feePlanSchema.methods.createNewVersion = async function() {
  const newPlan = this.toObject();
  delete newPlan._id;
  delete newPlan.createdAt;
  delete newPlan.updatedAt;
  
  newPlan.version = this.version + 1;
  newPlan.code = this.code.replace(`-V${this.version}`, `-V${newPlan.version}`);
  newPlan.effectiveFrom = new Date();
  newPlan.status = 'draft';
  
  // Mark current plan as superseded
  this.effectiveTo = new Date();
  this.status = 'inactive';
  
  const NewPlan = this.constructor;
  const created = await NewPlan.create(newPlan);
  
  this.supersededBy = created._id;
  await this.save();
  
  return created;
};

// Instance method to lock plan
feePlanSchema.methods.lockPlan = function() {
  if (this.locked) {
    throw new Error('Plan is already locked');
  }
  this.locked = true;
  return this.save();
};

// Instance method to check if plan is current
feePlanSchema.methods.isCurrent = function() {
  const now = new Date();
  return this.status === 'active' && 
         this.effectiveFrom <= now && 
         (this.effectiveTo === null || this.effectiveTo >= now);
};

// Virtual for formatted plan name
feePlanSchema.virtual('formattedName').get(function() {
  return `${this.program} - Year ${this.year} - Sem ${this.semester} (${this.quota})`;
});

// Ensure virtuals are included in JSON
feePlanSchema.set('toJSON', { virtuals: true });
feePlanSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FeePlan', feePlanSchema);
