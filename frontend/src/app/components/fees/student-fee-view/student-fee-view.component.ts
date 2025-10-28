import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedService } from '../../../services/shared.service';

interface FeeHead {
  name: string;
  amount: number;
  paid: number;
  pending: number;
  status: 'paid' | 'partial' | 'pending';
}

interface Installment {
  installmentNumber: number;
  dueDate: Date;
  amount: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
}

interface Payment {
  _id: string;
  date: Date;
  amount: number;
  mode: string;
  receiptNumber: string;
  transactionId?: string;
}

interface StudentBillDetails {
  student: {
    _id: string;
    name: string;
    registerNumber: string;
    class: string;
    section: string;
    quota: string;
  };
  bill: {
    billNumber: string;
    academicYear: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    status: string;
  };
  feeHeads: FeeHead[];
  installments: Installment[];
  payments: Payment[];
  concessions: any[];
}

@Component({
  selector: 'app-student-fee-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './student-fee-view.component.html',
  styleUrl: './student-fee-view.component.css'
})
export class StudentFeeViewComponent implements OnInit {
  studentId: string = '';
  billDetails = signal<StudentBillDetails | null>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');

  // Table columns
  feeHeadColumns: string[] = ['name', 'amount', 'paid', 'pending', 'status'];
  installmentColumns: string[] = ['installmentNumber', 'dueDate', 'amount', 'paidAmount', 'status'];
  paymentColumns: string[] = ['date', 'amount', 'mode', 'receiptNumber', 'actions'];

  // Safe accessors for template
  get safeStudent() {
    return this.billDetails()?.student || { name: '', registerNumber: '', class: '', section: '', quota: '' };
  }

  get safeBill() {
    return this.billDetails()?.bill || { billNumber: '', academicYear: '', totalAmount: 0, paidAmount: 0, pendingAmount: 0, overdueAmount: 0, status: '' };
  }

  get safePayments() {
    return this.billDetails()?.payments || [];
  }

  get safeConcessions() {
    return this.billDetails()?.concessions || [];
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
        this.loadStudentBill();
      }
    });
  }

  loadStudentBill(): void {
    this.loading.set(true);
    this.error.set('');

    this.sharedService.getStudentBill(this.studentId).subscribe({
      next: (data) => {
        this.billDetails.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading student bill:', err);
        this.error.set('Failed to load student fee details. Please try again.');
        this.loading.set(false);
      }
    });
  }

  navigateToPayment(): void {
    this.router.navigate(['/fees/pay-fees', this.studentId]);
  }

  navigateToReports(): void {
    this.router.navigate(['/fees/student-reports', this.studentId]);
  }

  downloadReceipt(paymentId: string): void {
    this.sharedService.downloadReceipt(paymentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt_${paymentId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading receipt:', err);
        alert('Failed to download receipt. Please try again.');
      }
    });
  }

  viewPaymentDetails(paymentId: string): void {
    // Navigate to payment details or show dialog
    this.router.navigate(['/fees/payment-details', paymentId]);
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'paid': 'primary',
      'partial': 'accent',
      'pending': 'warn',
      'overdue': 'warn'
    };
    return colors[status] || 'primary';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'paid': 'check_circle',
      'partial': 'pending',
      'pending': 'schedule',
      'overdue': 'error'
    };
    return icons[status] || 'info';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN');
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getPaymentModeIcon(mode: string): string {
    const icons: Record<string, string> = {
      'cash': 'payments',
      'card': 'credit_card',
      'upi': 'qr_code',
      'netbanking': 'account_balance',
      'cheque': 'receipt',
      'dd': 'receipt_long'
    };
    return icons[mode?.toLowerCase()] || 'payment';
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }

  getProgressPercentage(): number {
    const details = this.billDetails();
    if (!details) return 0;
    return (details.bill.paidAmount / details.bill.totalAmount) * 100;
  }
}
