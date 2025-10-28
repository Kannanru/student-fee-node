import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';

import { EmployeeService } from '../../../services/employee.service';
import { NotificationService } from '../../../services/notification.service';
import { SharedService } from '../../../services/shared.service';
import { Employee } from '../../../models/employee.model';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTabsModule
  ],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  employeeId: string | null = null;
  loading = false;

  constructor(
    private employeeService: EmployeeService,
    private notificationService: NotificationService,
    private sharedService: SharedService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId) {
      this.loadEmployee();
    } else {
      this.notificationService.showError('Employee ID not found');
      this.router.navigate(['/employees']);
    }
  }

  loadEmployee() {
    if (!this.employeeId) return;

    this.loading = true;
    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (employee) => {
        console.log('Employee loaded:', employee);
        this.employee = employee;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employee:', error);
        this.notificationService.showError('Failed to load employee details');
        this.loading = false;
        this.router.navigate(['/employees']);
      }
    });
  }

  getFullName(): string {
    if (!this.employee) return '';
    return `${this.employee.firstName} ${this.employee.lastName}`;
  }

  getFullAddress(): string {
    if (!this.employee?.address) return 'Not provided';
    const addr = this.employee.address;
    const parts = [addr.street, addr.city, addr.state, addr.pincode, addr.country].filter(p => p);
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  }

  getEmergencyContact(): string {
    if (!this.employee?.emergencyContact || !this.employee.emergencyContact.name) {
      return 'Not provided';
    }
    const contact = this.employee.emergencyContact;
    return `${contact.name} (${contact.relation}) - ${contact.phone || 'N/A'}`;
  }

  formatDate(date: any): string {
    return this.sharedService.formatDate(date);
  }

  formatCurrency(amount: number | undefined): string {
    return this.sharedService.formatCurrency(amount || 0);
  }

  getStatusColor(): string {
    switch (this.employee?.status) {
      case 'active': return 'primary';
      case 'inactive': return 'warn';
      case 'on-leave': return 'accent';
      case 'terminated': return 'warn';
      default: return '';
    }
  }

  getCategoryLabel(): string {
    const category = this.employee?.category;
    if (!category) return 'N/A';
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  editEmployee() {
    if (this.employeeId) {
      this.router.navigate(['/employees/edit', this.employeeId]);
    }
  }

  deleteEmployee() {
    if (!this.employeeId || !this.employee) return;

    const confirmMessage = `Are you sure you want to delete ${this.getFullName()}? This action cannot be undone.`;
    if (!confirm(confirmMessage)) return;

    this.employeeService.deleteEmployee(this.employeeId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Employee deleted successfully');
        this.router.navigate(['/employees']);
      },
      error: (error) => {
        console.error('Error deleting employee:', error);
        this.notificationService.showError('Failed to delete employee');
      }
    });
  }

  goBack() {
    this.router.navigate(['/employees']);
  }
}
