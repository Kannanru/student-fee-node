const mongoose = require('mongoose');

/**
 * Hall Model
 * Represents lecture/seminar halls with AI camera configuration
 */
const hallSchema = new mongoose.Schema({
  hallId: {
    type: String,
    required: [true, 'Hall ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 50
  },
  hallName: {
    type: String,
    required: [true, 'Hall name is required'],
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['Lecture', 'Seminar', 'Lab', 'Auditorium'],
    required: [true, 'Hall type is required']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [500, 'Capacity cannot exceed 500']
  },
  deviceId: {
    type: String,
    trim: true,
    maxlength: 100,
    index: true
  },
  cameraId: {
    type: String,
    required: [true, 'Camera ID is required'],
    trim: true,
    unique: true,
    maxlength: 100
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200
  },
  building: {
    type: String,
    trim: true,
    maxlength: 100
  },
  floor: {
    type: String,
    trim: true,
    maxlength: 50
  },
  cameraStatus: {
    type: String,
    enum: ['Online', 'Offline', 'Maintenance', 'Error'],
    default: 'Offline'
  },
  lastHealthCheck: {
    type: Date
  },
  recognitionAccuracy: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  configuration: {
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
    bufferHours: {
      type: Number,
      min: 0,
      max: 24,
      default: 2
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, { 
  timestamps: true 
});

// Indexes (hallId and cameraId already have unique indexes from schema)
hallSchema.index({ isActive: 1, cameraStatus: 1 });

// Virtual for occupancy (to be calculated dynamically)
hallSchema.virtual('currentOccupancy').get(function() {
  return 0; // Will be calculated in queries
});

module.exports = mongoose.model('Hall', hallSchema);
