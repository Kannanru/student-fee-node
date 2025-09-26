const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'] },
  employeeId: { type: String, required: [true, 'Employee ID is required'], unique: true },
  mobile: { type: String, required: [true, 'Mobile number is required'] },
  email: { type: String, required: [true, 'Email is required'], unique: true },
  role: { type: String, required: [true, 'Role is required'] },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  department: { type: String },
  photo: { type: String },
  altContact: { type: String },
  address: { type: String },
  dob: { type: Date },
  joiningDate: { type: Date },
  emergencyContact: { type: String },
  qualifications: { type: [String] },
  experience: { type: Number },
  bloodGroup: { type: String },
  maritalStatus: { type: String },
  nationality: { type: String },
  languages: { type: [String] },
  bankDetails: {
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String }
  },
  documents: {
    aadhar: { type: String },
    pan: { type: String },
    passport: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);