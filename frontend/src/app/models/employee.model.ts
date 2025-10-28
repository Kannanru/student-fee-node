export interface Employee {
  _id?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  joiningDate: Date;
  department: string;
  designation: string;
  category: 'faculty' | 'administrative' | 'technical' | 'support';
  qualification: string;
  experience: number; // in years
  bloodGroup: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
  status: 'active' | 'inactive' | 'terminated' | 'on-leave';
  avatar?: string;
  documents?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeeListResponse {
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
}

export interface EmployeeFilter {
  department?: string;
  designation?: string;
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}