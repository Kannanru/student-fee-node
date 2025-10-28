// Mock Student Data Service
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Student } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class MockStudentService {

  private mockStudents: Student[] = [
    {
      _id: '1',
      studentId: 'BDS2023001',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      enrollmentNumber: 'ENR2023001',
      email: 'rajesh.kumar@mgpgids.edu.in',
      contactNumber: '9876543210',
      dob: '2001-05-15',
      gender: 'Male',
      bloodGroup: 'B+',
      programName: 'BDS',
      semester: 2,
      section: 'A',
      rollNumber: '001',
      permanentAddress: 'Puducherry, India',
      academicYear: '2023-2027',
      admissionDate: '2023-01-15',
      guardianName: 'Kumar Sr.',
      guardianContact: '9876543211',
      emergencyContactName: 'Kumar Family',
      emergencyContactNumber: '9876543211',
      studentType: 'full-time',
      status: 'active',
      createdAt: '2023-01-15'
    },
    {
      _id: '2', 
      studentId: 'BDS2023002',
      firstName: 'Priya',
      lastName: 'Sharma',
      enrollmentNumber: 'ENR2023002',
      email: 'priya.sharma@mgpgids.edu.in',
      contactNumber: '9876543212',
      dob: '2000-08-22',
      gender: 'Female',
      bloodGroup: 'A+',
      programName: 'BDS',
      semester: 3,
      section: 'B',
      rollNumber: '002',
      permanentAddress: 'Chennai, Tamil Nadu',
      academicYear: '2023-2027',
      admissionDate: '2023-01-15',
      guardianName: 'Sharma Sr.',
      guardianContact: '9876543213',
      emergencyContactName: 'Sharma Family',
      emergencyContactNumber: '9876543213',
      studentType: 'full-time',
      status: 'active',
      createdAt: '2023-01-15'
    },
    {
      _id: '3',
      studentId: 'MDS2023001',
      firstName: 'Arjun',
      lastName: 'Patel',
      enrollmentNumber: 'ENR2023003',
      email: 'arjun.patel@mgpgids.edu.in',
      contactNumber: '9876543214',
      dob: '1998-12-10',
      gender: 'Male',
      bloodGroup: 'O+',
      programName: 'MBBS',
      semester: 1,
      section: 'A',
      rollNumber: '001',
      permanentAddress: 'Bangalore, Karnataka',
      academicYear: '2023-2027',
      admissionDate: '2023-01-15',
      guardianName: 'Patel Sr.',
      guardianContact: '9876543215',
      emergencyContactName: 'Patel Family',
      emergencyContactNumber: '9876543215',
      studentType: 'full-time',
      status: 'active',
      createdAt: '2023-01-15'
    },
    {
      _id: '4',
      studentId: 'BDS2022045',
      firstName: 'Kavya',
      lastName: 'Reddy',
      enrollmentNumber: 'ENR2022045',
      email: 'kavya.reddy@mgpgids.edu.in', 
      contactNumber: '9876543216',
      dob: '2001-03-18',
      gender: 'Female',
      bloodGroup: 'AB+',
      programName: 'BDS',
      semester: 4,
      section: 'A',
      rollNumber: '045',
      permanentAddress: 'Hyderabad, Telangana',
      academicYear: '2022-2026',
      admissionDate: '2022-07-15',
      guardianName: 'Reddy Sr.',
      guardianContact: '9876543217',
      emergencyContactName: 'Reddy Family',
      emergencyContactNumber: '9876543217',
      studentType: 'full-time',
      status: 'active',
      createdAt: '2022-07-15'
    },
    {
      _id: '5',
      studentId: 'BDS2023012',
      firstName: 'Mohammed',
      lastName: 'Rahman',
      enrollmentNumber: 'ENR2023012',
      email: 'mohammed.rahman@mgpgids.edu.in',
      contactNumber: '9876543218',
      dob: '2002-01-25',
      gender: 'Male',
      bloodGroup: 'O-',
      programName: 'BDS',
      semester: 1,
      section: 'B',
      rollNumber: '012',
      permanentAddress: 'Mumbai, Maharashtra',
      academicYear: '2023-2027',
      admissionDate: '2023-01-15',
      guardianName: 'Rahman Sr.',
      guardianContact: '9876543219',
      emergencyContactName: 'Rahman Family',
      emergencyContactNumber: '9876543219',
      studentType: 'full-time',
      status: 'inactive',
      createdAt: '2023-01-15'
    },
    {
      _id: '6',
      studentId: 'BDS2021089',
      firstName: 'Anjali',
      lastName: 'Nair',
      enrollmentNumber: 'ENR2021089',
      email: 'anjali.nair@mgpgids.edu.in',
      contactNumber: '9876543220',
      dob: '2000-11-08',
      gender: 'Female', 
      bloodGroup: 'A-',
      programName: 'BDS',
      semester: 10,
      section: 'A',
      rollNumber: '089',
      permanentAddress: 'Kochi, Kerala',
      academicYear: '2021-2025',
      admissionDate: '2021-07-15',
      guardianName: 'Nair Sr.',
      guardianContact: '9876543221',
      emergencyContactName: 'Nair Family',
      emergencyContactNumber: '9876543221',
      studentType: 'full-time',
      status: 'graduated',
      createdAt: '2021-07-15'
    },
    {
      _id: '7',
      studentId: 'BDS2023025',
      firstName: 'Rohit',
      lastName: 'Singh',
      enrollmentNumber: 'ENR2023025',
      email: 'rohit.singh@mgpgids.edu.in',
      contactNumber: '9876543222',
      dob: '2001-09-14',
      gender: 'Male',
      bloodGroup: 'B-',
      programName: 'BDS',
      semester: 2,
      section: 'C',
      rollNumber: '025',
      permanentAddress: 'Delhi, India',
      academicYear: '2023-2027',
      admissionDate: '2023-01-15',
      guardianName: 'Singh Sr.',
      guardianContact: '9876543223',
      emergencyContactName: 'Singh Family',
      emergencyContactNumber: '9876543223',
      studentType: 'full-time',
      status: 'suspended',
      createdAt: '2023-01-15'
    },
    {
      _id: '8',
      studentId: 'MDS2022002',
      firstName: 'Meera',
      lastName: 'Gupta',
      enrollmentNumber: 'ENR2022002',
      email: 'meera.gupta@mgpgids.edu.in',
      contactNumber: '9876543224',
      dob: '1997-06-30',
      gender: 'Female',
      bloodGroup: 'AB-',
      programName: 'MBBS',
      semester: 2,
      section: 'A',
      rollNumber: '002',
      permanentAddress: 'Pune, Maharashtra',
      academicYear: '2022-2026',
      admissionDate: '2022-07-15',
      guardianName: 'Gupta Sr.',
      guardianContact: '9876543225',
      emergencyContactName: 'Gupta Family',
      emergencyContactNumber: '9876543225',
      studentType: 'full-time',
      status: 'active',
      createdAt: '2022-07-15'
    }
  ];

  getStudents(params?: any): Observable<{ students: Student[], totalStudents: number }> {
    let filteredStudents = [...this.mockStudents];
    
    // Apply filters
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredStudents = filteredStudents.filter(student => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        return fullName.includes(search) ||
          student.studentId.toLowerCase().includes(search) ||
          student.email?.toLowerCase().includes(search);
      });
    }
    
    if (params?.status && params.status !== 'all') {
      filteredStudents = filteredStudents.filter(student => student.status === params.status);
    }
    
    if (params?.program && params.program !== 'all') {
      filteredStudents = filteredStudents.filter(student => student.programName === params.program);
    }

    return of({
      students: filteredStudents,
      totalStudents: filteredStudents.length
    });
  }

  getStudent(id: string): Observable<Student | null> {
    const student = this.mockStudents.find(s => s._id === id);
    return of(student || null);
  }

  createStudent(student: Partial<Student>): Observable<Student> {
    const newStudent: Student = {
      _id: Date.now().toString(),
      studentId: `BDS${new Date().getFullYear()}${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
      enrollmentNumber: `ENR${new Date().getFullYear()}${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      contactNumber: student.contactNumber || '',
      gender: student.gender || 'Male',
      dob: student.dob || new Date().toISOString(),
      programName: student.programName || 'BDS',
      semester: student.semester || 1,
      academicYear: student.academicYear || '2024-2028',
      admissionDate: student.admissionDate || new Date().toISOString(),
      permanentAddress: student.permanentAddress || '',
      guardianName: student.guardianName || '',
      guardianContact: student.guardianContact || '',
      emergencyContactName: student.emergencyContactName || '',
      emergencyContactNumber: student.emergencyContactNumber || '',
      studentType: student.studentType || 'full-time',
      section: student.section || '',
      rollNumber: student.rollNumber || '',
      status: student.status || 'active',
      createdAt: new Date().toISOString(),
      ...student
    };
    
    this.mockStudents.push(newStudent);
    return of(newStudent);
  }

  updateStudent(id: string, student: Partial<Student>): Observable<Student> {
    const index = this.mockStudents.findIndex(s => s._id === id);
    if (index !== -1) {
      this.mockStudents[index] = { ...this.mockStudents[index], ...student };
      return of(this.mockStudents[index]);
    }
    throw new Error('Student not found');
  }

  deleteStudent(id: string): Observable<boolean> {
    const index = this.mockStudents.findIndex(s => s._id === id);
    if (index !== -1) {
      this.mockStudents.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}