const mongoose = require('mongoose');

const quotaConfigSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Quota code is required'],
    unique: true,
    trim: true,
    lowercase: true,
    enum: ['puducherry-ut', 'all-india', 'nri', 'self-sustaining'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Quota name is required'],
    trim: true
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  defaultCurrency: {
    type: String,
    required: [true, 'Default currency is required'],
    enum: ['INR', 'USD'],
    default: 'INR'
  },
  requiresUSDTracking: {
    type: Boolean,
    default: false,
    comment: 'For NRI quota, track both INR and USD amounts'
  },
  seatAllocation: {
    type: Number,
    min: 0,
    comment: 'Total seats allocated for this quota'
  },
  eligibilityCriteria: {
    type: String,
    comment: 'Brief description of eligibility criteria'
  },
  priority: {
    type: Number,
    default: 0,
    comment: 'Display order priority (lower number = higher priority)'
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  metadata: {
    color: {
      type: String,
      default: '#1976d2',
      comment: 'UI color code for this quota'
    },
    icon: {
      type: String,
      default: 'people',
      comment: 'Material icon name'
    }
  }
}, {
  timestamps: true,
  collection: 'quota_configs'
});

// Indexes
quotaConfigSchema.index({ active: 1, priority: 1 });

// Virtual for formatted display
quotaConfigSchema.virtual('formattedName').get(function() {
  return `${this.displayName} (${this.code.toUpperCase()})`;
});

// Static method to get active quotas
quotaConfigSchema.statics.getActiveQuotas = function() {
  return this.find({ active: true }).sort({ priority: 1 });
};

// Static method to get quota by code
quotaConfigSchema.statics.getByCode = function(code) {
  return this.findOne({ code: code.toLowerCase(), active: true });
};

// Instance method to check if USD tracking required
quotaConfigSchema.methods.needsUSD = function() {
  return this.requiresUSDTracking === true;
};

// Pre-save validation
quotaConfigSchema.pre('save', function(next) {
  // NRI quota must have USD tracking
  if (this.code === 'nri') {
    this.requiresUSDTracking = true;
    this.defaultCurrency = 'USD';
  }
  
  // Puducherry UT and All India use INR only
  if (this.code === 'puducherry-ut' || this.code === 'all-india') {
    this.requiresUSDTracking = false;
    this.defaultCurrency = 'INR';
  }
  
  next();
});

// Ensure virtuals are included in JSON
quotaConfigSchema.set('toJSON', { virtuals: true });
quotaConfigSchema.set('toObject', { virtuals: true });

const QuotaConfig = mongoose.model('QuotaConfig', quotaConfigSchema);

module.exports = QuotaConfig;
