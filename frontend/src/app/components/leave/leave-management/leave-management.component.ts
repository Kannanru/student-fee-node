import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatAutocompleteModule
  ],
  templateUrl: './leave-management.component.html',
  styleUrls: ['./leave-management.component.css']
})
export class LeaveManagementComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api';

  leaveForm: FormGroup;
  students = signal<any[]>([]);
  filteredStudents = signal<any[]>([]);
  leaves = signal<any[]>([]);
  
  loading = signal(false);
  submitting = signal(false);
  
  leaveTypes = [
    'Sick Leave',
    'Medical Leave',
    'Personal Leave',
    'Emergency Leave',
    'Other'
  ];

  displayedColumns = ['studentName', 'dates', 'days', 'reason', 'status', 'actions'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.leaveForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadStudents();
    this.loadLeaves();
  }

  createForm(): FormGroup {
    return this.fb.group({
      studentId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', Validators.required],
      leaveType: ['Other', Validators.required],
      remarks: ['']
    });
  }

  loadStudents(): void {
    this.http.get<any>(`${this.apiUrl}/students`).subscribe({
      next: (response) => {
        const studentList = Array.isArray(response) ? response : (response?.data || response?.students || []);
        this.students.set(studentList);
        this.filteredStudents.set(studentList);
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.snackBar.open('Failed to load students', 'Close', { duration: 3000 });
      }
    });
  }

  onStudentSearch(event: any): void {
    const value = event.target.value?.toLowerCase() || '';
    if (!value) {
      this.filteredStudents.set(this.students());
      return;
    }

    const filtered = this.students().filter(student =>
      student.name?.toLowerCase().includes(value) ||
      student.studentId?.toLowerCase().includes(value) ||
      student.enrollmentNumber?.toLowerCase().includes(value) ||
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(value)
    );
    this.filteredStudents.set(filtered);
  }

  getStudentDisplayName(student: any): string {
    return student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.studentId;
  }

  calculateDays(): void {
    const startDate = this.leaveForm.get('startDate')?.value;
    const endDate = this.leaveForm.get('endDate')?.value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      if (days < 0) {
        this.snackBar.open('End date must be after start date', 'Close', { duration: 3000 });
      }
    }
  }

  submitLeave(): void {
    if (this.leaveForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.submitting.set(true);
    const formData = this.leaveForm.value;

    this.http.post<any>(`${this.apiUrl}/leave/apply`, formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Leave application submitted successfully', 'Close', { duration: 3000 });
          this.leaveForm.reset({ leaveType: 'Other' });
          this.loadLeaves();
        }
        this.submitting.set(false);
      },
      error: (error) => {
        console.error('Error submitting leave:', error);
        this.snackBar.open(error.error?.message || 'Failed to submit leave', 'Close', { duration: 3000 });
        this.submitting.set(false);
      }
    });
  }

  loadLeaves(filters?: any): void {
    this.loading.set(true);
    
    let url = `${this.apiUrl}/leave`;
    if (filters) {
      const params = new URLSearchParams(filters).toString();
      url += `?${params}`;
    }

    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response.success) {
          this.leaves.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading leaves:', error);
        this.snackBar.open('Failed to load leave requests', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  approveLeave(leave: any): void {
    if (confirm(`Approve leave for ${leave.studentName}?`)) {
      this.http.put<any>(`${this.apiUrl}/leave/${leave._id}/approve`, {}).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Leave approved successfully', 'Close', { duration: 3000 });
            this.loadLeaves();
          }
        },
        error: (error) => {
          console.error('Error approving leave:', error);
          this.snackBar.open('Failed to approve leave', 'Close', { duration: 3000 });
        }
      });
    }
  }

  rejectLeave(leave: any): void {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.http.put<any>(`${this.apiUrl}/leave/${leave._id}/reject`, { rejectionReason: reason }).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Leave rejected successfully', 'Close', { duration: 3000 });
            this.loadLeaves();
          }
        },
        error: (error) => {
          console.error('Error rejecting leave:', error);
          this.snackBar.open('Failed to reject leave', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteLeave(leave: any): void {
    if (confirm(`Delete leave application for ${leave.studentName}?`)) {
      this.http.delete<any>(`${this.apiUrl}/leave/${leave._id}`).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Leave deleted successfully', 'Close', { duration: 3000 });
            this.loadLeaves();
          }
        },
        error: (error) => {
          console.error('Error deleting leave:', error);
          this.snackBar.open(error.error?.message || 'Failed to delete leave', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  filterByStatus(status: string): void {
    this.loadLeaves({ status });
  }

  clearFilters(): void {
    this.loadLeaves();
  }
}
