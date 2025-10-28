// src/app/models/student.model.ts
export interface Student {
  _id?: string;
  
  // Core Required Fields (matching backend schema)
  studentId: string;
  enrollmentNumber: string;
  firstName: string;
  lastName: string;
  dob: string | Date;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  contactNumber: string;
  aadharNumber?: string;
  permanentAddress: string;
  currentAddress?: string;
  programName: string;
  academicYear: string;
  semester: number;
  admissionDate: string | Date;
  guardianName: string;
  guardianContact: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  studentType: string;
  password?: string; // Only for create, not returned on read
  status: 'active' | 'inactive' | 'suspended' | 'graduated';
  
  // Optional Fields
  bloodGroup?: string;
  rollNumber?: string;
  section?: string;
  gpa?: number;
  cgpa?: number;
  tuitionFeesPaid?: number;
  healthInsuranceProvider?: string;
  disabilitiesOrSupportRequirements?: string;
  courseEnrollmentStatus?: 'enrolled' | 'completed' | 'withdrawn' | 'suspended';
  profilePicture?: string;
  
  // Parent Information (Optional)
  parentInfo?: {
    fatherName?: string;
    fatherOccupation?: string;
    fatherPhone?: string;
    motherName?: string;
    motherOccupation?: string;
    motherPhone?: string;
    parentEmail?: string;
  };
  
  // Fee Information
  feeCategory?: string;
  concessionType?: string;
  concessionAmount?: number;
  
  // Medical Information
  medicalInfo?: string;
  
  // Timestamps
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Guardian {
  fatherName: string;
  motherName: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianOccupation: string;
  guardianAddress: string;
}

export interface StudentListResponse {
  students: Student[];
  totalStudents: number;
  total?: number;
  page?: number;
  limit?: number;
}

export interface StudentQuery {
  page?: number;
  limit?: number;
  search?: string;
  class?: string;
  section?: string;
  status?: string;
  programName?: string;
}