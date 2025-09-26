const mongoose = require('mongoose');

// Penalty Configuration Schema for Master Data
const penaltyConfigSchema = new mongoose.Schema({
  academicYear: { 
    type: String, 
    required: [true, 'Academic year is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{4}-[0-9]{4}$/.test(v);
      },
      message: 'Academic year format should be like 2025-2026'
    }
  },
  penaltyType: { 
    type: String, 
    required: [true, 'Penalty type is required'],
    enum: {
      values: ['Fixed', 'Percentage', 'Daily'],
      message: 'Penalty type must be Fixed, Percentage, or Daily'
    }
  },
  penaltyAmount: { 
    type: Number, 
    required: [true, 'Penalty amount is required'], 
    min: [0, 'Penalty amount cannot be negative'] 
  },
  penaltyPercentage: { 
    type: Number, 
    min: [0, 'Penalty percentage cannot be negative'],
    max: [100, 'Penalty percentage cannot exceed 100']
  },
  gracePeriodDays: { 
    type: Number, 
    default: 0, 
    min: [0, 'Grace period cannot be negative'] 
  },
  maxPenaltyAmount: { 
    type: Number, 
    min: [0, 'Maximum penalty amount cannot be negative'] 
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

// Method to calculate penalty for a given amount and days overdue
penaltyConfigSchema.methods.calculatePenalty = function(feeAmount, daysOverdue) {
  if (daysOverdue <= this.gracePeriodDays) {
    return 0;
  }
  
  let penalty = 0;
  const effectiveDays = daysOverdue - this.gracePeriodDays;
  
  switch (this.penaltyType) {
    case 'Fixed':
      penalty = this.penaltyAmount;
      break;
    case 'Percentage':
      penalty = (feeAmount * this.penaltyPercentage) / 100;
      break;
    case 'Daily':
      penalty = this.penaltyAmount * effectiveDays;
      break;
  }
  
  // Apply maximum penalty limit if set
  if (this.maxPenaltyAmount && penalty > this.maxPenaltyAmount) {
    penalty = this.maxPenaltyAmount;
  }
  
  return Math.round(penalty);
};

module.exports = mongoose.model('PenaltyConfig', penaltyConfigSchema);