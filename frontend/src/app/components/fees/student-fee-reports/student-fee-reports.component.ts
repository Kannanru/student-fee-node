import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SharedService } from '../../../services/shared.service';

interface StudentReport {
  student: {
    name: string;
    registerNumber: string;
    class: string;
    section: string;
  };
  bill: {
    billNumber: string;
    academicYear: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  };
  payments: Array<{
    _id: string;
    date: Date;
    amount: number;
    mode: string;
    receiptNumber: string;
  }>;
  installments: Array<{
    installmentNumber: number;
    dueDate: Date;
    amount: number;
    paidAmount: number;
    status: string;
  }>;
  feeHeads: Array<{
    name: string;
    amount: number;
    paid: number;
    pending: number;
  }>;
}

@Component({
  selector: 'app-student-fee-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDividerModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './student-fee-reports.component.html',
  styleUrl: './student-fee-reports.component.css'
})
export class StudentFeeReportsComponent implements OnInit {
  studentId: string = '';
  reportData = signal<StudentReport | null>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');
  currentDate = new Date();
  downloading = signal<boolean>(false);

  selectedReportType: string = 'summary';
  
  reportTypes = [
    { value: 'summary', label: 'Fee Summary Report' },
    { value: 'payment-history', label: 'Payment History Report' },
    { value: 'installment', label: 'Installment Schedule Report' },
    { value: 'detailed', label: 'Detailed Fee Report' }
  ];

  // Safe accessors for template
  get safeStudent() {
    return this.reportData()?.student || { name: '', registerNumber: '', class: '', section: '' };
  }

  get safeBill() {
    return this.reportData()?.bill || { billNumber: '', academicYear: '', totalAmount: 0, paidAmount: 0, pendingAmount: 0 };
  }

  get safePayments() {
    return this.reportData()?.payments || [];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.studentId = params['id'];
      if (this.studentId) {
        this.loadReportData();
      }
    });
  }

  loadReportData(): void {
    this.loading.set(true);
    this.error.set('');

    this.sharedService.getStudentBill(this.studentId).subscribe({
      next: (data: any) => {
        this.reportData.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading report data:', err);
        this.error.set('Failed to load report data. Please try again.');
        this.loading.set(false);
      }
    });
  }

  downloadPDF(): void {
    this.downloading.set(true);
    // Simulate PDF generation
    setTimeout(() => {
      const element = document.getElementById('report-content');
      if (element) {
        window.print();
      }
      this.downloading.set(false);
    }, 500);
  }

  downloadExcel(): void {
    this.downloading.set(true);
    // Simulate Excel export
    setTimeout(() => {
      alert('Excel export functionality will be implemented');
      this.downloading.set(false);
    }, 500);
  }

  printReport(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/fees/student-fee-view', this.studentId]);
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN');
  }

  getTotalPaidPercentage(): number {
    const data = this.reportData();
    if (!data) return 0;
    return (data.bill.paidAmount / data.bill.totalAmount) * 100;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'paid': '#4CAF50',
      'partial': '#FF9800',
      'pending': '#F44336',
      'overdue': '#D32F2F'
    };
    return colors[status] || '#757575';
  }
}
