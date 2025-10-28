// src/app/services/employee.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Employee, EmployeeFilter } from '../models/employee.model';

export interface EmployeeQuery {
  page?: number;
  limit?: number;
  role?: string;
  department?: string;
  designation?: string;
  category?: string;
  status?: string;
  search?: string;
  q?: string;
}

export interface EmployeeListResponse {
  employees: Employee[];
  totalEmployees: number;
  pagination?: {
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  
  constructor(private apiService: ApiService) {}

  /**
   * Get all employees with optional filters and pagination
   */
  getEmployees(query?: EmployeeQuery): Observable<EmployeeListResponse> {
    console.log('🔍 Fetching employees with query:', query);
    
    return this.apiService.get<any>('/employees', query).pipe(
      map((res: any) => {
        console.log('📥 Raw API response:', res);
        
        // Normalize backend response
        if (Array.isArray(res)) {
          return { employees: res as Employee[], totalEmployees: res.length };
        }
        
        const employees: Employee[] = res?.items || res?.employees || res?.data || [];
        const totalEmployees: number = res?.total ?? res?.totalEmployees ?? employees.length;
        const currentPage = res?.page ?? query?.page ?? 1;
        const limit = res?.limit ?? query?.limit ?? 20;
        const totalPages = Math.ceil(totalEmployees / limit);
        
        const pagination = {
          currentPage,
          totalPages,
          limit
        };
        
        console.log('✅ Normalized response:', { totalEmployees, page: currentPage });
        
        return { employees, totalEmployees, pagination } as EmployeeListResponse;
      }),
      catchError((error) => {
        console.error('❌ Error fetching employees:', error);
        throw error;
      })
    );
  }

  /**
   * Get employee by ID
   */
  getEmployeeById(id: string): Observable<Employee> {
    console.log('🔍 Fetching employee by ID:', id);
    
    return this.apiService.get<any>(`/employees/${id}`).pipe(
      map((res: any) => {
        console.log('📥 Employee data received:', res);
        // Handle both { data: employee } and direct employee response
        const employee = res?.data || res;
        console.log('✅ Employee:', employee);
        return employee as Employee;
      }),
      catchError((error) => {
        console.error('❌ Error fetching employee:', error);
        throw error;
      })
    );
  }

  /**
   * Create new employee
   */
  createEmployee(data: Partial<Employee>): Observable<Employee> {
    console.log('📤 Creating employee:', data);
    
    return this.apiService.post<any>('/employees', data).pipe(
      map((res: any) => {
        console.log('✅ Employee created:', res);
        return res?.data || res;
      }),
      catchError((error) => {
        console.error('❌ Error creating employee:', error);
        throw error;
      })
    );
  }

  /**
   * Update employee
   */
  updateEmployee(id: string, data: Partial<Employee>): Observable<Employee> {
    console.log('📤 Updating employee:', id, data);
    
    return this.apiService.put<any>(`/employees/${id}`, data).pipe(
      map((res: any) => {
        console.log('✅ Employee updated:', res);
        return res?.data || res;
      }),
      catchError((error) => {
        console.error('❌ Error updating employee:', error);
        throw error;
      })
    );
  }

  /**
   * Delete employee
   */
  deleteEmployee(id: string): Observable<void> {
    console.log('🗑️ Deleting employee:', id);
    
    return this.apiService.delete<any>(`/employees/${id}`).pipe(
      map((res: any) => {
        console.log('✅ Employee deleted');
        return;
      }),
      catchError((error) => {
        console.error('❌ Error deleting employee:', error);
        throw error;
      })
    );
  }

  /**
   * Search employees
   */
  searchEmployees(searchTerm: string, filters?: EmployeeQuery): Observable<EmployeeListResponse> {
    const query = { ...filters, q: searchTerm };
    return this.getEmployees(query);
  }

  /**
   * Get employees by department
   */
  getEmployeesByDepartment(department: string): Observable<EmployeeListResponse> {
    return this.getEmployees({ department });
  }

  /**
   * Get employees by category
   */
  getEmployeesByCategory(category: string): Observable<EmployeeListResponse> {
    return this.getEmployees({ category });
  }

  /**
   * Get employees by status
   */
  getEmployeesByStatus(status: string): Observable<EmployeeListResponse> {
    return this.getEmployees({ status });
  }

  /**
   * Get employee statistics
   */
  getEmployeeStats(): Observable<any> {
    console.log('📊 Fetching employee statistics');
    
    return this.apiService.get<any>('/employees/stats').pipe(
      map((res: any) => {
        console.log('✅ Statistics received:', res);
        return res?.data || res;
      }),
      catchError((error) => {
        console.error('❌ Error fetching statistics:', error);
        throw error;
      })
    );
  }

  /**
   * Get unique departments
   */
  getDepartments(): Observable<string[]> {
    return this.getEmployees({ limit: 1000 }).pipe(
      map(response => {
        const departments = new Set<string>();
        response.employees.forEach((emp: Employee) => {
          if (emp.department) departments.add(emp.department);
        });
        return Array.from(departments).sort();
      })
    );
  }

  /**
   * Get unique designations
   */
  getDesignations(): Observable<string[]> {
    return this.getEmployees({ limit: 1000 }).pipe(
      map(response => {
        const designations = new Set<string>();
        response.employees.forEach((emp: Employee) => {
          if (emp.designation) designations.add(emp.designation);
        });
        return Array.from(designations).sort();
      })
    );
  }
}
