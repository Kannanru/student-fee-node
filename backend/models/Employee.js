// models/Employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  // Basic Information
  employeeId: { 
    type: String, 
    required: [true, 'Employee ID is required'], 
    unique: true,
    trim: true,
    uppercase: true
  },
  firstName: { 
    type: String, 
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: { 
    type: String, 
    required: [true, 'Last name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: 'Phone number must be 10 digits'
    }
  },
  dateOfBirth: { 
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: { 
    type: String, 
    enum: {
      values: ['male', 'female', 'other'],
      message: 'Gender must be male, female, or other'
    },
    required: [true, 'Gender is required']
  },
  bloodGroup: { 
    type: String,
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: 'Invalid blood group'
    }
  },
  
  // Professional Information
  joiningDate: { 
    type: Date,
    required: [true, 'Joining date is required']
  },
  department: { 
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  designation: { 
    type: String,
    required: [true, 'Designation is required'],
    trim: true
  },
  category: { 
    type: String,
    enum: {
      values: ['faculty', 'administrative', 'technical', 'support'],
      message: 'Category must be faculty, administrative, technical, or support'
    },
    required: [true, 'Category is required']
  },
  qualification: { 
    type: String,
    required: [true, 'Qualification is required'],
    trim: true
  },
  experience: { 
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative']
  },
  
  // Address Information
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { 
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^[0-9]{6}$/.test(v);
        },
        message: 'Pincode must be 6 digits'
      }
    },
    country: { type: String, trim: true, default: 'India' }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: { type: String, trim: true },
    relation: { type: String, trim: true },
    phone: { 
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^[0-9]{10}$/.test(v);
        },
        message: 'Emergency contact phone must be 10 digits'
      }
    }
  },
  
  // Status and Additional Info
  status: { 
    type: String, 
    enum: {
      values: ['active', 'inactive', 'terminated', 'on-leave'],
      message: 'Status must be active, inactive, terminated, or on-leave'
    },
    default: 'active' 
  },
  avatar: { type: String },
  documents: [{ type: String }],
  
  // Legacy fields for backward compatibility
  role: { type: String },
  mobile: { type: String },
  photo: { type: String },
  altContact: { type: String },
  dob: { type: Date },
  qualifications: [{ type: String }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to sync legacy fields
employeeSchema.pre('save', function(next) {
  // Sync legacy fields
  if (!this.mobile && this.phone) this.mobile = this.phone;
  if (!this.dob && this.dateOfBirth) this.dob = this.dateOfBirth;
  
  next();
});

// Indexes for better query performance
// Note: employeeId and email already have unique indexes from schema definition
employeeSchema.index({ department: 1 });
employeeSchema.index({ category: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ firstName: 1, lastName: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
