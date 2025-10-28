const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Mandatory Fields (Core Information)
  studentId: { 
    type: String, 
    required: [true, 'Student ID is required'], 
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{2,4}[0-9]{4,6}$/.test(v);
      },
      message: 'Student ID format should be like STU001234'
    }
  },
  enrollmentNumber: { 
    type: String, 
    required: [true, 'Enrollment number is required'], 
    unique: true,
    trim: true
  },
  firstName: { 
    type: String, 
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: 'First name should contain only letters'
    }
  },
  lastName: { 
    type: String, 
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: 'Last name should contain only letters'
    }
  },
  dob: { 
    type: Date, 
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(value) {
        const today = new Date();
        const age = today.getFullYear() - value.getFullYear();
        return value < today && age >= 16 && age <= 35;
      },
      message: 'Date of birth must be valid and age should be between 16-35 years'
    }
  },
  gender: { 
    type: String, 
    required: [true, 'Gender is required'],
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: 'Gender must be Male, Female, or Other'
    }
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  contactNumber: { 
    type: String, 
    required: [true, 'Contact number is required'],
    validate: {
      validator: function(phone) {
        return /^[6-9][0-9]{9}$/.test(phone);
      },
      message: 'Contact number must be a valid 10-digit Indian mobile number'
    }
  },
  aadharNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^[0-9]{12}$/.test(v);
      },
      message: 'Aadhar number must be exactly 12 digits'
    }
  },
  permanentAddress: { 
    type: String, 
    required: [true, 'Permanent address is required'],
    trim: true,
    minlength: [10, 'Address must be at least 10 characters'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  currentAddress: {
    type: String,
    trim: true,
    minlength: [10, 'Address must be at least 10 characters'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  programName: { 
    type: String, 
    required: [true, 'Program/Course name is required'],
    trim: true,
    enum: {
      values: ['BDS', 'MDS'],
      message: 'Program must be BDS or MDS'
    }
  },
  admissionDate: { 
    type: Date, 
    required: [true, 'Admission date is required'],
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Admission date cannot be in the future'
    }
  },
  academicYear: { 
    type: String, 
    required: [true, 'Academic year/batch is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{4}-[0-9]{4}$/.test(v);
      },
      message: 'Academic year format should be like 2025-2029'
    }
  },
  gpa: { 
    type: Number,
    min: [0, 'GPA cannot be negative'],
    max: [10, 'GPA cannot exceed 10'],
    validate: {
      validator: function(v) {
        return v === null || v === undefined || (v >= 0 && v <= 10);
      },
      message: 'GPA must be between 0 and 10'
    }
  },
  cgpa: { 
    type: Number, 
    min: [0, 'CGPA cannot be negative'], 
    max: [10, 'CGPA cannot exceed 10'] 
  },
  tuitionFeesPaid: { 
    type: Number,
    default: 0,
    min: [0, 'Tuition fees paid cannot be negative']
  },
  
  // Highly Recommended Fields
  guardianName: { 
    type: String, 
    required: [true, 'Guardian name is required'],
    trim: true,
    minlength: [2, 'Guardian name must be at least 2 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: 'Guardian name should contain only letters'
    }
  },
  guardianContact: { 
    type: String, 
    required: [true, 'Guardian contact is required'],
    validate: {
      validator: function(phone) {
        return /^[6-9][0-9]{9}$/.test(phone);
      },
      message: 'Guardian contact must be a valid 10-digit Indian mobile number'
    }
  },
  emergencyContactName: { 
    type: String, 
    required: [true, 'Emergency contact name is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: 'Emergency contact name should contain only letters'
    }
  },
  emergencyContactNumber: { 
    type: String, 
    required: [true, 'Emergency contact number is required'],
    validate: {
      validator: function(phone) {
        return /^[6-9][0-9]{9}$/.test(phone);
      },
      message: 'Emergency contact must be a valid 10-digit Indian mobile number'
    }
  },
  healthInsuranceProvider: { 
    type: String,
    trim: true,
    maxlength: [100, 'Insurance provider name cannot exceed 100 characters']
  },
  disabilitiesOrSupportRequirements: { 
    type: String,
    trim: true,
    maxlength: [500, 'Support requirements cannot exceed 500 characters']
  },
  courseEnrollmentStatus: { 
    type: String,
    enum: {
      values: ['enrolled', 'completed', 'withdrawn', 'suspended'],
      message: 'Invalid enrollment status'
    },
    default: 'enrolled'
  },
  studentType: { 
    type: String,
    required: [true, 'Student type is required'],
    enum: {
      values: ['full-time', 'part-time'],
      message: 'Student type must be full-time or part-time'
    }
  },
  
  // Profile and System Fields
  profilePicture: { 
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(v);
      },
      message: 'Profile picture must be a valid image URL'
    }
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v);
      },
      message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    }
  },
  status: { 
    type: String, 
    enum: {
      values: ['active', 'inactive'],
      message: 'Status must be active or inactive'
    },
    default: 'active' 
  },
  
  // Academic Details
  semester: { 
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^(1|2|3|4|5|6|7|8|9|10)$/.test(v);
      },
      message: 'Semester must be between 1 and 10'
    }
  },
  year: {
    type: Number,
    min: [1, 'Year must be at least 1'],
    max: [5, 'Year cannot exceed 5'],
    validate: {
      validator: function(v) {
        return !v || (Number.isInteger(v) && v >= 1 && v <= 5);
      },
      message: 'Year must be an integer between 1 and 5'
    }
  },
  quota: {
    type: String,
    trim: true,
    enum: {
      values: ['puducherry-ut', 'all-india', 'nri', 'self-sustaining'],
      message: 'Quota must be one of: puducherry-ut, all-india, nri, self-sustaining'
    }
  },
  section: {
    type: String,
    trim: true,
    uppercase: true,
    default: 'A',
    validate: {
      validator: function(v) {
        return !v || /^[A-Z]$/.test(v);
      },
      message: 'Section must be a single letter (A, B, C, D, etc.)'
    }
  },
  rollNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^[0-9A-Za-z]+$/.test(v);
      },
      message: 'Roll number must contain only letters and numbers'
    }
  },
  previousSchool: { 
    type: String,
    trim: true,
    maxlength: [200, 'Previous school name cannot exceed 200 characters']
  },
  attendancePercentage: { 
    type: Number, 
    min: [0, 'Attendance percentage cannot be negative'], 
    max: [100, 'Attendance percentage cannot exceed 100'] 
  },
  transcripts: [{
    semester: {
      type: String,
      required: [true, 'Semester is required for transcript']
    },
    subjects: [{
      subjectName: {
        type: String,
        required: [true, 'Subject name is required']
      },
      grade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
        required: [true, 'Grade is required']
      },
      credits: {
        type: Number,
        min: [1, 'Credits must be at least 1'],
        max: [10, 'Credits cannot exceed 10']
      }
    }],
    sgpa: {
      type: Number,
      min: [0, 'SGPA cannot be negative'],
      max: [10, 'SGPA cannot exceed 10']
    }
  }],
  
  // Personal Details
  bloodGroup: { 
    type: String,
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: 'Invalid blood group'
    }
  },
  nationality: { 
    type: String, 
    default: 'Indian',
    trim: true,
    maxlength: [50, 'Nationality cannot exceed 50 characters']
  },
  languageProficiency: [{ 
    language: {
      type: String,
      required: [true, 'Language name is required'],
      trim: true
    },
    level: { 
      type: String, 
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced', 'Fluent'],
        message: 'Language level must be Beginner, Intermediate, Advanced, or Fluent'
      },
      required: [true, 'Language level is required']
    }
  }],
  medicalHistory: { 
    type: [String],
    validate: {
      validator: function(v) {
        return !v || v.every(item => item.trim().length >= 5);
      },
      message: 'Each medical history entry must be at least 5 characters'
    }
  },
  
  // Custom/Optional Fields
  extracurricularActivities: [{ 
    activityName: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true,
      maxlength: [100, 'Activity name cannot exceed 100 characters']
    },
    role: {
      type: String,
      trim: true,
      maxlength: [50, 'Role cannot exceed 50 characters']
    },
    duration: {
      type: String,
      trim: true,
      maxlength: [50, 'Duration cannot exceed 50 characters']
    }
  }],
  hobbies: { 
    type: [String],
    validate: {
      validator: function(v) {
        return !v || v.every(hobby => hobby.trim().length >= 2);
      },
      message: 'Each hobby must be at least 2 characters'
    }
  },
  achievements: [{
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
      trim: true,
      maxlength: [100, 'Achievement title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Achievement description cannot exceed 500 characters']
    },
    date: {
      type: Date,
      validate: {
        validator: function(value) {
          return !value || value <= new Date();
        },
        message: 'Achievement date cannot be in the future'
      }
    },
    category: { 
      type: String, 
      enum: {
        values: ['Academic', 'Sports', 'Cultural', 'Leadership', 'Other'],
        message: 'Achievement category must be Academic, Sports, Cultural, Leadership, or Other'
      }
    }
  }],
  scholarshipsGrants: [{
    name: {
      type: String,
      required: [true, 'Scholarship name is required'],
      trim: true,
      maxlength: [100, 'Scholarship name cannot exceed 100 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Scholarship amount is required'],
      min: [1, 'Scholarship amount must be greater than 0']
    },
    provider: {
      type: String,
      required: [true, 'Scholarship provider is required'],
      trim: true,
      maxlength: [100, 'Provider name cannot exceed 100 characters']
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      validate: {
        validator: function(v) {
          return /^[0-9]{4}-[0-9]{4}$/.test(v);
        },
        message: 'Academic year format should be like 2025-2026'
      }
    }
  }],
  volunteerWork: [{
    organization: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [100, 'Organization name cannot exceed 100 characters']
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters']
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
      maxlength: [50, 'Duration cannot exceed 50 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    }
  }],
  
  // Documents
  documents: {
    aadhar: { 
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^[0-9]{4}-[0-9]{4}-[0-9]{4}$/.test(v);
        },
        message: 'Aadhar number format should be like 1234-5678-9012'
      }
    },
    birthCertificate: { type: String },
    transferCertificate: { type: String },
    marksheets: [{ 
      class: {
        type: String,
        required: [true, 'Class is required for marksheet']
      },
      fileUrl: {
        type: String,
        required: [true, 'File URL is required for marksheet']
      }
    }],
    medicalCertificate: { type: String }
  },
  
  // Financial Details
  feeDetails: {
    totalFees: { 
      type: Number, 
      default: 0,
      min: [0, 'Total fees cannot be negative']
    },
    paidAmount: { 
      type: Number, 
      default: 0,
      min: [0, 'Paid amount cannot be negative']
    },
    dueAmount: { 
      type: Number, 
      default: 0,
      min: [0, 'Due amount cannot be negative']
    },
    lastPaymentDate: { type: Date },
    paymentHistory: [{
      amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [1, 'Payment amount must be greater than 0']
      },
      date: {
        type: Date,
        required: [true, 'Payment date is required']
      },
      transactionId: {
        type: String,
        required: [true, 'Transaction ID is required']
      },
      paymentMode: {
        type: String,
        required: [true, 'Payment mode is required'],
        enum: {
          values: ['Online', 'Cash', 'Cheque', 'DD', 'Card'],
          message: 'Invalid payment mode'
        }
      },
      status: { 
        type: String, 
        enum: {
          values: ['success', 'pending', 'failed'],
          message: 'Payment status must be success, pending, or failed'
        },
        required: [true, 'Payment status is required']
      }
    }]
  }
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Student', studentSchema);
