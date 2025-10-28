// src/app/services/student.service.ts
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import { Student, StudentListResponse, StudentQuery } from '../models/student.model';
import { environment } from '../../environments/environment';
import { MockStudentService } from './mock-student.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  
  constructor(private apiService: ApiService, private mockStudentService: MockStudentService) {}

  // Get all students with optional filters and pagination
  getStudents(query?: StudentQuery): Observable<StudentListResponse> {
    if (environment.useMockData) {
      return this.mockStudentService.getStudents(query);
    }
    return this.apiService.get<any>('/students', query).pipe(
      map((res: any) => {
        // Backend returns: {success: true, data: students[], pagination: {...}}
        if (Array.isArray(res)) {
          return { students: res as Student[], totalStudents: res.length };
        }
        const students: Student[] = res?.data || res?.students || [];
        const totalStudents: number = res?.pagination?.total ?? res?.totalStudents ?? res?.total ?? students.length;
        return { students, totalStudents } as StudentListResponse;
      })
    );
  }

  // Get student by ID
  getStudentById(id: string): Observable<Student> {
    if (environment.useMockData) {
      return this.mockStudentService.getStudent(id) as Observable<Student>;
    }
    return this.apiService.get<any>(`/students/profile/${id}`).pipe(
      map((res: any) => {
        // Backend returns: {success: true, data: student}
        console.log('Raw API response for student:', res);
        const student = res?.data || res?.student || res;
        console.log('Mapped student data:', student);
        console.log('Section value:', student?.section);
        console.log('Roll Number value:', student?.rollNumber);
        return student;
      })
    );
  }

  // Create new student
  createStudent(studentData: Partial<Student>): Observable<Student> {
    if (environment.useMockData) {
      return this.mockStudentService.createStudent(studentData);
    }
    return this.apiService.post<any>('/students', studentData).pipe(
      map((res: any) => {
        // Backend returns: {success: true, data: student}
        return res?.data || res?.student || res;
      })
    );
  }

  // Update student
  updateStudent(id: string, studentData: Partial<Student>): Observable<Student> {
    if (environment.useMockData) {
      return this.mockStudentService.updateStudent(id, studentData);
    }
    return this.apiService.put<any>(`/students/${id}`, studentData).pipe(
      map((res: any) => {
        // Backend returns: {success: true, data: student}
        return res?.data || res?.student || res;
      })
    );
  }

  // Delete student
  deleteStudent(id: string): Observable<void> {
    if (environment.useMockData) {
      // Bridge to mock service for deletes in mock mode
      return this.mockStudentService.deleteStudent(id) as unknown as Observable<void>;
    }
    return this.apiService.delete<void>(`/students/${id}`);
  }

  // Student login (for mobile/public access)
  studentLogin(credentials: { email: string; password: string }): Observable<any> {
    return this.apiService.post('/students/login', credentials);
  }

  // Search students
  searchStudents(searchTerm: string, filters?: StudentQuery): Observable<StudentListResponse> {
    const query = { ...filters, search: searchTerm };
    return this.getStudents(query);
  }

  // Get students by program
  getStudentsByProgram(programName: string, page = 1, limit = 10): Observable<StudentListResponse> {
    return this.getStudents({ programName, page, limit });
  }

  // Get students by class and section
  getStudentsByClass(className: string, section?: string): Observable<StudentListResponse> {
    const query: any = { class: className };
    if (section) {
      query.section = section;
    }
    return this.getStudents(query);
  }
}