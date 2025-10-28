import { Injectable } from '@angular/core';
import { Employee, EmployeeListResponse, EmployeeFilter } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class MockEmployeeService {
  
  private employees: Employee[] = [
    {
      _id: 'emp001',
      employeeId: 'MGPGIDS/FAC/001',
      firstName: 'Dr. Rajesh',
      lastName: 'Kumar',
      email: 'rajesh.kumar@mgpgids.edu.in',
      phone: '+91-9876543210',
      dateOfBirth: new Date('1975-06-15'),
      gender: 'male',
      joiningDate: new Date('2010-07-01'),
      department: 'Oral & Maxillofacial Surgery',
      designation: 'Professor & Head',
      category: 'faculty',
      qualification: 'MDS, FDSRCS',
      experience: 18,
      bloodGroup: 'B+',
      address: {
        street: '123 Faculty Colony',
        city: 'Puducherry',
        state: 'Puducherry',
        pincode: '605006',
        country: 'India'
      },
      emergencyContact: {
        name: 'Priya Kumar',
        relation: 'Spouse',
        phone: '+91-9876543211'
      },
      status: 'active',
      createdAt: new Date('2010-07-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      _id: 'emp002',
      employeeId: 'MGPGIDS/FAC/002',
      firstName: 'Dr. Sunita',
      lastName: 'Sharma',
      email: 'sunita.sharma@mgpgids.edu.in',
      phone: '+91-9876543212',
      dateOfBirth: new Date('1980-03-22'),
      gender: 'female',
      joiningDate: new Date('2015-08-15'),
      department: 'Prosthodontics',
      designation: 'Associate Professor',
      category: 'faculty',
      qualification: 'MDS',
      experience: 12,
      bloodGroup: 'A+',
      address: {
        street: '456 Medical Staff Quarters',
        city: 'Puducherry',
        state: 'Puducherry',
        pincode: '605006',
        country: 'India'
      },
      emergencyContact: {
        name: 'Amit Sharma',
        relation: 'Husband',
        phone: '+91-9876543213'
      },
      status: 'active',
      createdAt: new Date('2015-08-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      _id: 'emp003',
      employeeId: 'MGPGIDS/ADM/003',
      firstName: 'Mr. Venkat',
      lastName: 'Raman',
      email: 'venkat.raman@mgpgids.edu.in',
      phone: '+91-9876543214',
      dateOfBirth: new Date('1985-11-10'),
      gender: 'male',
      joiningDate: new Date('2018-01-10'),
      department: 'Administration',
      designation: 'Registrar',
      category: 'administrative',
      qualification: 'MBA',
      experience: 8,
      bloodGroup: 'O+',
      address: {
        street: '789 Admin Block',
        city: 'Puducherry',
        state: 'Puducherry',
        pincode: '605006',
        country: 'India'
      },
      emergencyContact: {
        name: 'Lakshmi Raman',
        relation: 'Mother',
        phone: '+91-9876543215'
      },
      status: 'active',
      createdAt: new Date('2018-01-10'),
      updatedAt: new Date('2024-01-15')
    },
    {
      _id: 'emp004',
      employeeId: 'MGPGIDS/FAC/004',
      firstName: 'Dr. Anita',
      lastName: 'Devi',
      email: 'anita.devi@mgpgids.edu.in',
      phone: '+91-9876543216',
      dateOfBirth: new Date('1978-09-05'),
      gender: 'female',
      joiningDate: new Date('2012-03-20'),
      department: 'Periodontics',
      designation: 'Professor',
      category: 'faculty',
      qualification: 'MDS, PhD',
      experience: 15,
      bloodGroup: 'AB+',
      address: {
        street: '321 Senior Faculty Housing',
        city: 'Puducherry',
        state: 'Puducherry',
        pincode: '605006',
        country: 'India'
      },
      emergencyContact: {
        name: 'Ravi Devi',
        relation: 'Spouse',
        phone: '+91-9876543217'
      },
      status: 'active',
      createdAt: new Date('2012-03-20'),
      updatedAt: new Date('2024-01-15')
    },
    {
      _id: 'emp005',
      employeeId: 'MGPGIDS/TEC/005',
      firstName: 'Mr. Arjun',
      lastName: 'Patel',
      email: 'arjun.patel@mgpgids.edu.in',
      phone: '+91-9876543218',
      dateOfBirth: new Date('1990-12-18'),
      gender: 'male',
      joiningDate: new Date('2020-06-01'),
      department: 'IT Support',
      designation: 'System Administrator',
      category: 'technical',
      qualification: 'B.Tech Computer Science',
      experience: 5,
      bloodGroup: 'B-',
      address: {
        street: '654 Technical Staff Quarters',
        city: 'Puducherry',
        state: 'Puducherry',
        pincode: '605006',
        country: 'India'
      },
      emergencyContact: {
        name: 'Meera Patel',
        relation: 'Sister',
        phone: '+91-9876543219'
      },
      status: 'active',
      createdAt: new Date('2020-06-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      _id: 'emp006',
      employeeId: 'MGPGIDS/SUP/006',
      firstName: 'Mrs. Kamala',
      lastName: 'Nair',
      email: 'kamala.nair@mgpgids.edu.in',
      phone: '+91-9876543220',
      dateOfBirth: new Date('1988-04-30'),
      gender: 'female',
      joiningDate: new Date('2019-09-15'),
      department: 'Housekeeping',
      designation: 'Supervisor',
      category: 'support',
      qualification: '12th Pass',
      experience: 6,
      bloodGroup: 'A-',
      address: {
        street: '987 Support Staff Colony',
        city: 'Puducherry',
        state: 'Puducherry',
        pincode: '605006',
        country: 'India'
      },
      emergencyContact: {
        name: 'Suresh Nair',
        relation: 'Husband',
        phone: '+91-9876543221'
      },
      status: 'active',
      createdAt: new Date('2019-09-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      _id: 'emp007',
      employeeId: 'MGPGIDS/FAC/007',
      firstName: 'Dr. Mohan',
      lastName: 'Das',
      email: 'mohan.das@mgpgids.edu.in',
      phone: '+91-9876543222',
      dateOfBirth: new Date('1982-07-12'),
      gender: 'male',
      joiningDate: new Date('2016-11-01'),
      department: 'Orthodontics',
      designation: 'Assistant Professor',
      category: 'faculty',
      qualification: 'MDS',
      experience: 10,
      bloodGroup: 'O-',
      address: {
        street: '147 Junior Faculty Block',
        city: 'Puducherry',
        state: 'Puducherry',
        pincode: '605006',
        country: 'India'
      },
      emergencyContact: {
        name: 'Gita Das',
        relation: 'Mother',
        phone: '+91-9876543223'
      },
      status: 'on-leave',
      createdAt: new Date('2016-11-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      _id: 'emp008',
      employeeId: 'MGPGIDS/ADM/008',
      firstName: 'Ms. Rekha',
      lastName: 'Singh',
      email: 'rekha.singh@mgpgids.edu.in',
      phone: '+91-9876543224',
      dateOfBirth: new Date('1992-01-25'),
      gender: 'female',
      joiningDate: new Date('2021-04-12'),
      department: 'Accounts',
      designation: 'Accountant',
      category: 'administrative',
      qualification: 'M.Com, CA',
      experience: 4,
      bloodGroup: 'AB-',
      address: {
        street: '258 Admin Staff Quarters',
        city: 'Puducherry',
        state: 'Puducherry',
        pincode: '605006',
        country: 'India'
      },
      emergencyContact: {
        name: 'Vikash Singh',
        relation: 'Brother',
        phone: '+91-9876543225'
      },
      status: 'inactive',
      createdAt: new Date('2021-04-12'),
      updatedAt: new Date('2024-01-15')
    }
  ];

  getEmployees(filter?: EmployeeFilter): Employee[] {
    let filteredEmployees = [...this.employees];

    if (filter) {
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        filteredEmployees = filteredEmployees.filter(emp =>
          emp.firstName.toLowerCase().includes(searchTerm) ||
          emp.lastName.toLowerCase().includes(searchTerm) ||
          emp.employeeId.toLowerCase().includes(searchTerm) ||
          emp.email.toLowerCase().includes(searchTerm) ||
          emp.department.toLowerCase().includes(searchTerm) ||
          emp.designation.toLowerCase().includes(searchTerm)
        );
      }

      if (filter.department) {
        filteredEmployees = filteredEmployees.filter(emp => emp.department === filter.department);
      }

      if (filter.designation) {
        filteredEmployees = filteredEmployees.filter(emp => emp.designation === filter.designation);
      }

      if (filter.category) {
        filteredEmployees = filteredEmployees.filter(emp => emp.category === filter.category);
      }

      if (filter.status) {
        filteredEmployees = filteredEmployees.filter(emp => emp.status === filter.status);
      }
    }

    return filteredEmployees;
  }

  getEmployeeById(id: string): Employee | undefined {
    return this.employees.find(emp => emp._id === id);
  }

  addEmployee(employee: Omit<Employee, '_id' | 'createdAt' | 'updatedAt'>): Employee {
    const newEmployee: Employee = {
      ...employee,
      _id: 'emp' + (this.employees.length + 1).toString().padStart(3, '0'),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.employees.push(newEmployee);
    return newEmployee;
  }

  updateEmployee(id: string, employee: Partial<Employee>): Employee | null {
    const index = this.employees.findIndex(emp => emp._id === id);
    if (index !== -1) {
      this.employees[index] = {
        ...this.employees[index],
        ...employee,
        updatedAt: new Date()
      };
      return this.employees[index];
    }
    return null;
  }

  deleteEmployee(id: string): boolean {
    const index = this.employees.findIndex(emp => emp._id === id);
    if (index !== -1) {
      this.employees.splice(index, 1);
      return true;
    }
    return false;
  }

  getDepartments(): string[] {
    const departments = [...new Set(this.employees.map(emp => emp.department))];
    return departments.sort();
  }

  getDesignations(): string[] {
    const designations = [...new Set(this.employees.map(emp => emp.designation))];
    return designations.sort();
  }

  getCategories(): string[] {
    return ['faculty', 'administrative', 'technical', 'support'];
  }

  getEmployeeStats() {
    return {
      total: this.employees.length,
      active: this.employees.filter(emp => emp.status === 'active').length,
      inactive: this.employees.filter(emp => emp.status === 'inactive').length,
      onLeave: this.employees.filter(emp => emp.status === 'on-leave').length,
      terminated: this.employees.filter(emp => emp.status === 'terminated').length,
      byCategory: {
        faculty: this.employees.filter(emp => emp.category === 'faculty').length,
        administrative: this.employees.filter(emp => emp.category === 'administrative').length,
        technical: this.employees.filter(emp => emp.category === 'technical').length,
        support: this.employees.filter(emp => emp.category === 'support').length
      }
    };
  }
}