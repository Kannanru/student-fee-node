const mongoose = require('mongoose');

/**
 * AttendanceSettings Model
 * Stores configurable attendance policies and thresholds
 */
const attendanceSettingsSchema = new mongoose.Schema({
  department: {
    type: String,
    trim: true,
    maxlength: 100,
    default: 'GLOBAL'
  },
  program: {
    type: String,
    trim: true,
    maxlength: 50
  },
  year: {
    type: Number,
    min: 1,
    max: 6
  },
  semester: {
    type: Number,
    min: 1,
    max: 12
  },
  // Grace period configuration
  gracePeriodMinutes: {
    type: Number,
    required: [true, 'Grace period is required'],
    min: 0,
    max: 60,
    default: 10
  },
  // Percentage of class duration student must be present
  presenceThresholdPercent: {
    type: Number,
    required: [true, 'Presence threshold is required'],
    min: 0,
    max: 100,
    default: 70
  },
  // Minutes after start time before marked late
  lateThresholdMinutes: {
    type: Number,
    required: [true, 'Late threshold is required'],
    min: 0,
    max: 60,
    default: 10
  },
  // Minutes after half-time before marked absent
  absentThresholdPercent: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  // Camera recognition settings
  cameraSettings: {
    minConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.85
    },
    maxSpoofScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.1
    },
    requireLiveness: {
      type: Boolean,
      default: true
    },
    allowMask: {
      type: Boolean,
      default: false
    },
    duplicateEventWindowSeconds: {
      type: Number,
      min: 0,
      max: 600,
      default: 30
    }
  },
  // Attendance calculation rules
  calculationRules: {
    weekendCounting: {
      type: Boolean,
      default: false
    },
    holidaysCounting: {
      type: Boolean,
      default: false
    },
    minimumAttendancePercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 75
    },
    attendanceShortfallAction: {
      type: String,
      enum: ['None', 'Warning', 'Block Exam', 'Detain'],
      default: 'Warning'
    }
  },
  // Notification settings
  notificationSettings: {
    alertOnAbsent: {
      type: Boolean,
      default: true
    },
    alertOnLate: {
      type: Boolean,
      default: false
    },
    alertThresholdPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    },
    notifyParents: {
      type: Boolean,
      default: true
    },
    notifyStudent: {
      type: Boolean,
      default: true
    },
    notifyFaculty: {
      type: Boolean,
      default: false
    }
  },
  // Manual override permissions
  overridePermissions: {
    facultyCanOverride: {
      type: Boolean,
      default: true
    },
    proctorCanOverride: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    maxOverridesPerDay: {
      type: Number,
      min: 0,
      max: 50,
      default: 10
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  effectiveFrom: {
    type: Date,
    default: Date.now
  },
  effectiveTo: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, { 
  timestamps: true 
});

// Indexes
attendanceSettingsSchema.index({ department: 1, program: 1, year: 1, semester: 1 });
attendanceSettingsSchema.index({ isActive: 1, priority: -1 });

// Static method to get applicable settings
attendanceSettingsSchema.statics.getApplicableSettings = async function(department, program, year, semester) {
  // Try to find most specific settings first
  let settings = await this.findOne({
    department,
    program,
    year,
    semester,
    isActive: true
  }).sort({ priority: -1 });

  if (!settings) {
    // Try department + program level
    settings = await this.findOne({
      department,
      program,
      year: null,
      semester: null,
      isActive: true
    }).sort({ priority: -1 });
  }

  if (!settings) {
    // Try department level
    settings = await this.findOne({
      department,
      program: null,
      year: null,
      semester: null,
      isActive: true
    }).sort({ priority: -1 });
  }

  if (!settings) {
    // Fall back to global settings
    settings = await this.findOne({
      department: 'GLOBAL',
      isActive: true
    }).sort({ priority: -1 });
  }

  return settings;
};

module.exports = mongoose.model('AttendanceSettings', attendanceSettingsSchema);
