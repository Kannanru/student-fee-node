// src/app/components/fees/fee-dashboard/fee-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';

import { DashboardService } from '../../../services/dashboard.service';
import { 
  DashboardFeeStats, 
  DashboardRecentPayment, 
  DashboardDefaulter,
  DashboardCollectionSummary
} from '../../../models/fee-management.model';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-fee-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule
  ],
  providers: [CurrencyPipe, DatePipe, DashboardService],
  templateUrl: './fee-dashboard.component.html',
  styleUrls: ['./fee-dashboard.component.css']
})
export class FeeDashboardComponent implements OnInit, OnDestroy {
  // Dashboard data
  feeStats: DashboardFeeStats | null = null;
  recentPayments: DashboardRecentPayment[] = [];
  feeDefaulters: DashboardDefaulter[] = [];
  collectionSummary: DashboardCollectionSummary | null = null;
  
  // Loading and error states
  loading: boolean = true;
  error: string | null = null;
  
  // Filters
  selectedAcademicYear: string;
  selectedQuota: string = 'all';
  selectedDepartment: string = 'all';
  
  // Available filter options
  academicYears: string[] = [];
  quotas: string[] = ['all', 'PU', 'AI', 'NRI', 'SS'];
  departments: string[] = [
    'all', 
    'General Medicine', 
    'Surgery', 
    'Pediatrics', 
    'Obstetrics & Gynecology',
    'Orthopedics',
    'Anesthesiology',
    'Radiology',
    'Pathology'
  ];
  
  // Table columns
  paymentColumns: string[] = ['student', 'amount', 'mode', 'date', 'receipt'];
  defaulterColumns: string[] = ['student', 'program', 'dueAmount', 'overdue', 'contact', 'actions'];

  // Constants
  currentAcademicYear: string;
  
  // Auto-refresh
  private destroy$ = new Subject<void>();
  autoRefreshEnabled: boolean = false;

  // Quick Actions configuration
  quickActions: Array<{ title: string; subtitle: string; icon: string; route: string; color: 'primary' | 'accent' | 'warn' }> = [
    { title: 'Collect Payment', subtitle: 'Record a new payment', icon: 'add_card', route: '/fees/collection', color: 'primary' },
    { title: 'Fee Structure', subtitle: 'Manage fee heads & plans', icon: 'account_tree', route: '/fees/structures', color: 'accent' },
    { title: 'Master Setup', subtitle: 'Configure fee heads & quotas', icon: 'settings', route: '/fees/master/fee-heads', color: 'primary' },
    { title: 'Reports', subtitle: 'View collection reports', icon: 'insights', route: '/fees/reports', color: 'accent' }
  ];

  constructor(
    private dashboardService: DashboardService,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe,
    private router: Router
  ) {
    // Initialize with current academic year
    this.currentAcademicYear = this.dashboardService.getCurrentAcademicYear();
    this.selectedAcademicYear = this.currentAcademicYear;
    this.academicYears = this.dashboardService.getAcademicYears();
  }

  ngOnInit(): void {
    this.loadDashboardData();
    
    // Setup auto-refresh (optional)
    if (this.autoRefreshEnabled) {
      this.setupAutoRefresh();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all dashboard data using the efficient overview API
   */
  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Build filters
    const filters: any = {
      academicYear: this.selectedAcademicYear
    };
    
    if (this.selectedQuota !== 'all') {
      filters.quota = this.selectedQuota;
    }
    
    if (this.selectedDepartment !== 'all') {
      filters.department = this.selectedDepartment;
    }

    // Use the efficient overview API that fetches all data in one call
    this.dashboardService.getDashboardOverview(filters).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.feeStats = response.data.stats;
          this.recentPayments = response.data.recentPayments;
          this.feeDefaulters = response.data.defaulters;
          this.collectionSummary = response.data.collectionSummary;
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
      }
    });
  }

  /**
   * Handle filter changes
   */
  onFilterChange(): void {
    this.loadDashboardData();
  }

  /**
   * Setup auto-refresh for real-time data
   */
  setupAutoRefresh(): void {
    interval(30000) // Refresh every 30 seconds
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadDashboardData();
      });
  }

  /**
   * Toggle auto-refresh
   */
  toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    if (this.autoRefreshEnabled) {
      this.setupAutoRefresh();
    }
  }

  /**
   * Manual refresh
   */
  refresh(): void {
    this.loadDashboardData();
  }

  // ========== Formatting & Display Methods ==========

  formatCurrency(amount: number): string {
    return this.dashboardService.formatCurrency(amount);
  }

  formatDate(date: string | Date): string {
    return this.datePipe.transform(date, 'mediumDate') || '';
  }

  formatPaymentMode(mode: string): string {
    return this.dashboardService.formatPaymentMode(mode);
  }

  getQuotaDisplayName(quotaCode: string): string {
    return this.dashboardService.getQuotaDisplayName(quotaCode);
  }

  getQuotaColor(quotaCode: string): string {
    return this.dashboardService.getQuotaColor(quotaCode);
  }

  getCollectionTrend(): 'up' | 'down' | 'neutral' {
    if (!this.feeStats) return 'neutral';
    const totalCollected = this.feeStats.totalCollection?.amount || 0;
    const totalPending = this.feeStats.pendingAmount?.amount || 0;
    const total = totalCollected + totalPending;
    const collectionPercentage = total > 0 ? (totalCollected / total) * 100 : 0;
    return collectionPercentage > 75 ? 'up' : 
           collectionPercentage > 50 ? 'neutral' : 'down';
  }

  getPaymentModeIcon(mode: string): string {
    const map: Record<string, string> = {
      cash: 'attach_money',
      bank_transfer: 'account_balance',
      card: 'credit_card',
      cheque: 'receipt_long',
      demand_draft: 'description',
      online: 'payments',
      upi: 'qr_code_scanner'
    };
    return map[mode?.toLowerCase()] || 'payment';
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'failed':
      case 'cancelled':
        return 'warn';
      default:
        return 'accent';
    }
  }

  getUrgencyColor(daysOverdue: number): string {
    if (daysOverdue > 60) return '#d32f2f';
    if (daysOverdue > 30) return '#f57c00';
    return '#fbc02d';
  }

  // ========== Navigation & Actions ==========

  viewStudentFees(studentId: string): void {
    if (!studentId) return;
    this.router.navigate(['/fees/student', studentId]);
  }

  navigateToCreateInvoice(): void {
    this.router.navigate(['/fees/invoice/create']);
  }

  navigateToRecordPayment(): void {
    this.router.navigate(['/fees/payment/record']);
  }

  navigateToReports(): void {
    this.router.navigate(['/fees/reports']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/fees/settings']);
  }

  navigateToFeeStructure(): void {
    this.router.navigate(['/fees/structure']);
  }

  navigateToStudentFees(): void {
    this.router.navigate(['/fees']);
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  viewPaymentDetails(payment: DashboardRecentPayment): void {
    if (!payment.receiptNumber) return;
    this.router.navigate(['/fees/payment', payment.receiptNumber]);
  }

  contactDefaulter(defaulter: DashboardDefaulter): void {
    console.log('Contact defaulter:', defaulter);
  }

  sendReminder(defaulter: DashboardDefaulter): void {
    console.log('Send reminder to:', defaulter);
  }

  generateReport(): void {
    this.router.navigate(['/fees/reports'], { 
      queryParams: { type: 'dashboard', year: this.selectedAcademicYear } 
    });
  }

  exportData(): void {
    console.log('Export dashboard data');
  }
}