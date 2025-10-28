// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'accounts', 'student'], default: 'admin' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  
  // Student Profile Details
  studentId: { type: String, unique: true, sparse: true }, // Only for students
  photo: { type: String }, // URL or base64 encoded image
  
  // Personal Information
  firstName: { type: String },
  lastName: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  phone: { type: String },
  alternatePhone: { type: String },
  
  // Academic Information
  class: { type: String },
  section: { type: String },
  rollNumber: { type: String },
  admissionNumber: { type: String },
  admissionDate: { type: Date },
  academicYear: { type: String },
  
  // Address Information
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: 'India' }
  },
  
  // Guardian Information
  guardian: {
    fatherName: { type: String },
    motherName: { type: String },
    guardianName: { type: String },
    guardianPhone: { type: String },
    guardianEmail: { type: String },
    guardianOccupation: { type: String },
    guardianAddress: { type: String }
  },
  
  // Additional Information
  bloodGroup: { type: String },
  emergencyContact: { type: String },
  medicalInfo: { type: String },
  
  // Fee Information
  feeCategory: { type: String },
  concessionType: { type: String },
  concessionAmount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
