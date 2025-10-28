import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FeeService } from '../../../services/fee.service';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-fee-reports-enhanced',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './fee-reports-enhanced.component.html',
  styleUrl: './fee-reports-enhanced.component.css'
})
export class FeeReportsEnhancedComponent implements OnInit {
  // Forms
  dailyReportForm: FormGroup;
  departmentReportForm: FormGroup;
  paymentMethodReportForm: FormGroup;

  // Data
  reportData: any[] = [];
  loading = false;
  currentReportType = '';

  // Table columns
  dailyColumns = ['studentName', 'studentId', 'program', 'year', 'feeHead', 'amount', 'paymentMethod', 'transactionId', 'receiptNumber', 'paymentTime', 'status'];
  departmentColumns = ['program', 'year', 'totalStudents', 'totalCollected', 'totalTransactions', 'averagePayment'];
  paymentMethodColumns = ['paymentMethod', 'totalTransactions', 'totalAmount', 'averageAmount', 'percentage'];

  // Options
  programs = ['BDS', 'MBBS', 'MD', 'MS', 'BSc Nursing', 'MSc Nursing'];
  years = [1, 2, 3, 4, 5];
  semesters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  paymentMethods = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'Bank Transfer', 'Cheque', 'DD'];

  constructor(
    private feeService: FeeService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    
    this.dailyReportForm = this.fb.group({
      fromDate: [lastWeek],
      toDate: [today],
      program: [''],
      year: [null],
      semester: [null]
    });

    this.departmentReportForm = this.fb.group({
      fromDate: [lastWeek],
      toDate: [today],
      program: ['']
    });

    this.paymentMethodReportForm = this.fb.group({
      fromDate: [lastWeek],
      toDate: [today],
      paymentMethod: ['']
    });
  }

  ngOnInit(): void {}

  // Daily Fee Payment Report (like attendance daily report)
  generateDailyReport(): void {
    this.loading = true;
    this.currentReportType = 'daily';
    const filters = this.dailyReportForm.value;

    // Call the new daily payments API endpoint with date range
    this.apiService.get('/fees/daily-payments', {
      fromDate: this.formatDate(filters.fromDate),
      toDate: this.formatDate(filters.toDate),
      program: filters.program || undefined,
      year: filters.year || undefined,
      semester: filters.semester || undefined
    }).subscribe({
      next: (response: any) => {
        this.reportData = response.data || [];
        this.loading = false;
        if (this.reportData.length === 0) {
          this.snackBar.open('No fee payments found for the selected date range and filters', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open(`Found ${this.reportData.length} payment records`, 'Close', { duration: 2000 });
        }
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.snackBar.open('Failed to generate daily payment report', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // Department Summary Report
  generateDepartmentReport(): void {
    this.loading = true;
    this.currentReportType = 'department';
    const filters = this.departmentReportForm.value;

    this.apiService.get('/fees/daily-department-summary', {
      fromDate: this.formatDate(filters.fromDate),
      toDate: this.formatDate(filters.toDate),
      program: filters.program || undefined
    }).subscribe({
      next: (response: any) => {
        this.reportData = response.data || [];
        this.loading = false;
        if (this.reportData.length === 0) {
          this.snackBar.open('No payment data found for the selected date range and filters', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open(`Found ${this.reportData.length} department records`, 'Close', { duration: 2000 });
        }
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.snackBar.open('Failed to generate department summary', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // Payment Method Report
  generatePaymentMethodReport(): void {
    this.loading = true;
    this.currentReportType = 'paymentMethod';
    const filters = this.paymentMethodReportForm.value;

    this.apiService.get('/fees/daily-payment-methods', {
      fromDate: this.formatDate(filters.fromDate),
      toDate: this.formatDate(filters.toDate),
      paymentMethod: filters.paymentMethod || undefined
    }).subscribe({
      next: (response: any) => {
        this.reportData = response.data || [];
        this.loading = false;
        if (this.reportData.length === 0) {
          this.snackBar.open('No payment data found for the selected date range and filters', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open(`Found ${this.reportData.length} payment method records`, 'Close', { duration: 2000 });
        }
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.snackBar.open('Failed to generate payment method report', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // Utility functions
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  exportToCSV(): void {
    if (this.reportData.length === 0) {
      this.snackBar.open('No data to export', 'Close', { duration: 3000 });
      return;
    }

    const headers = this.getColumnsForCurrentReport().map(col => col.replace(/([A-Z])/g, ' $1').trim());
    const csvContent = [
      headers.join(','),
      ...this.reportData.map(row => 
        this.getColumnsForCurrentReport().map(col => {
          const value = row[col];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fee_payment_report_${this.currentReportType}_${this.formatDate(new Date())}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToExcel(): void {
    this.snackBar.open('Excel export functionality will be implemented with xlsx library', 'Close', { duration: 3000 });
  }

  exportToPDF(): void {
    this.snackBar.open('PDF export functionality will be implemented with jsPDF', 'Close', { duration: 3000 });
  }

  private getColumnsForCurrentReport(): string[] {
    switch (this.currentReportType) {
      case 'daily': return this.dailyColumns;
      case 'department': return this.departmentColumns;
      case 'paymentMethod': return this.paymentMethodColumns;
      default: return [];
    }
  }

  getDisplayedColumns(): string[] {
    return this.getColumnsForCurrentReport();
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    return 'status-' + status.toLowerCase().replace(/\s+/g, '-');
  }
}