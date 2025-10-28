// src/app/models/auth.model.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'employee';
  status: 'active' | 'inactive';
  studentId?: string;
  photo?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  alternatePhone?: string;
  class?: string;
  section?: string;
  rollNumber?: string;
  admissionNumber?: string;
  admissionDate?: string;
  academicYear?: string;
  address?: Address;
  guardian?: Guardian;
  bloodGroup?: string;
  emergencyContact?: string;
  medicalInfo?: string;
  feeCategory?: string;
  concessionType?: string;
  concessionAmount?: number;
  createdAt: string;
  updatedAt: string;
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

export interface UpdateProfileRequest {
  photo?: string;
  phone?: string;
  address?: Address;
  emergencyContact?: string;
  medicalInfo?: string;
}