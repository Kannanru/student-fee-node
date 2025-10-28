import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

// Angular Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { ListViewComponent } from '../../shared/list-view/list-view.component';
import { ListItem } from '../../../services/shared.service';

// Services and Models
import { EmployeeService } from '../../../services/employee.service';
import { Employee } from '../../../models/employee.model';
import { NotificationService } from '../../../services/notification.service';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    ListViewComponent
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  listItems: ListItem[] = [];
  loading = false;
  searchTerm = '';
  selectedDepartment = '';
  selectedCategory = '';
  selectedStatus = '';
  selectedTabIndex = 0;

  departments: string[] = [];
  categories: string[] = [];
  
  stats = {
    total: 0,
    active: 0,
    inactive: 0,
    onLeave: 0,
    terminated: 0,
    byCategory: {
      faculty: 0,
      administrative: 0,
      technical: 0,
      support: 0
    }
  };

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private employeeService: EmployeeService,
    private notificationService: NotificationService,
    private router: Router,
    private sharedService: SharedService
  ) {
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  ngOnInit() {
    this.loadEmployees();
    this.loadFilterOptions();
    this.updateStats();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployees() {
    this.loading = true;
    
    const filters: any = {};
    if (this.searchTerm) filters.q = this.searchTerm;
    if (this.selectedDepartment && this.selectedDepartment !== 'all') filters.department = this.selectedDepartment;
    if (this.selectedCategory && this.selectedCategory !== 'all') filters.category = this.selectedCategory;
    if (this.selectedStatus && this.selectedStatus !== 'all') filters.status = this.selectedStatus;
    
    console.log('Loading employees with filters:', filters);
    
    this.employeeService.getEmployees(filters).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('✅ Employees loaded:', response);
        this.employees = response.employees;
        this.convertEmployeesToListItems();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading employees:', error);
        this.notificationService.showError('Failed to load employee data');
        this.loading = false;
      }
    });
  }

  loadFilterOptions() {
    // Load unique departments
    this.employeeService.getDepartments().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
    
    // Categories are static
    this.categories = ['faculty', 'administrative', 'technical', 'support'];
  }

  convertEmployeesToListItems() {
    this.listItems = this.employees.map(employee => {
      const statusMap: Record<string, 'Active' | 'Inactive' | 'Pending' | 'Draft'> = {
        'active': 'Active',
        'inactive': 'Inactive',
        'on-leave': 'Pending',
        'terminated': 'Draft'
      };

      return {
        id: employee._id!,
        title: `${employee.firstName} ${employee.lastName}`,
        subtitle: `${employee.employeeId} • ${employee.designation}`,
        description: `${employee.department} • ${employee.category.charAt(0).toUpperCase() + employee.category.slice(1)}`,
        status: statusMap[employee.status] || 'Draft',
        tags: [
          employee.category.charAt(0).toUpperCase() + employee.category.slice(1),
          `${employee.experience} yrs exp`,
          employee.qualification
        ],
        metadata: [
          { label: 'Email', value: employee.email },
          { label: 'Phone', value: employee.phone },
          { label: 'Joining Date', value: this.sharedService.formatDate(employee.joiningDate) }
        ]
      };
    });
  }

  updateStats() {
    this.employeeService.getEmployeeStats().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (stats) => {
        console.log('✅ Statistics loaded:', stats);
        this.stats = {
          total: stats.total || 0,
          active: stats.byStatus?.active || 0,
          inactive: stats.byStatus?.inactive || 0,
          onLeave: stats.byStatus?.['on-leave'] || 0,
          terminated: stats.byStatus?.terminated || 0,
          byCategory: {
            faculty: stats.byCategory?.faculty || 0,
            administrative: stats.byCategory?.administrative || 0,
            technical: stats.byCategory?.technical || 0,
            support: stats.byCategory?.support || 0
          }
        };
      },
      error: (error) => {
        console.error('❌ Error loading statistics:', error);
        // Initialize with zeros if error
        this.stats = {
          total: 0,
          active: 0,
          inactive: 0,
          onLeave: 0,
          terminated: 0,
          byCategory: {
            faculty: 0,
            administrative: 0,
            technical: 0,
            support: 0
          }
        };
      }
    });
  }

  getFilteredItems(status: string): ListItem[] {
    return this.listItems.filter(item => {
      const employee = this.employees.find(emp => emp._id === item.id);
      return employee?.status === status;
    });
  }

  onSearchChange(event: any) {
    const value = event.target.value;
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  performSearch(searchTerm: string) {
    this.loadEmployees();
  }

  onDepartmentChange(department: string) {
    this.selectedDepartment = department;
    this.loadEmployees();
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.loadEmployees();
  }

  onStatusChange(status: string) {
    this.selectedStatus = status;
    this.loadEmployees();
  }

  onTabChange(index: number) {
    this.selectedTabIndex = index;
  }

  addEmployee() {
    this.router.navigate(['/employees/add']);
  }

  viewEmployee(employeeId: string) {
    this.router.navigate(['/employees/view', employeeId]);
  }

  editEmployee(employeeId: string) {
    this.router.navigate(['/employees/edit', employeeId]);
  }

  deleteEmployee(employeeId: string) {
    const employee = this.employees.find(emp => emp._id === employeeId);
    if (employee) {
      const confirmMessage = `Are you sure you want to delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`;
      if (confirm(confirmMessage)) {
        console.log('🗑️ Deleting employee:', employeeId);
        
        this.employeeService.deleteEmployee(employeeId).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            console.log('✅ Employee deleted successfully');
            this.notificationService.showSuccess('Employee deleted successfully');
            this.loadEmployees();
            this.updateStats();
          },
          error: (error) => {
            console.error('❌ Error deleting employee:', error);
            this.notificationService.showError('Failed to delete employee');
          }
        });
      }
    }
  }
}