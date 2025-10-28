import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';

import { FeeService } from '../../../services/fee.service';
import { NotificationService } from '../../../services/notification.service';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-fees-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './fees-reports.component.html',
  styleUrls: ['./fees-reports.component.css']
})
export class FeesReportsComponent implements OnInit {
  loading = signal(false);
  rows = signal<any[]>([]);
  summary = signal<{ totalAmount: number; count: number; average: number } | null>(null);
  pageTotal = signal(0);

  startDate: Date = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  endDate: Date = new Date();
  feeType = '';
  paymentMode = '';
  minAmount?: number;
  maxAmount?: number;

  displayed = ['date', 'student', 'feeType', 'mode', 'amount', 'status'];
  pageIndex = 0;
  pageSize = 10;
  total = 0;
  sortBy = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  private studentNameCache = new Map<string, string>();

  feeTypes = [
    { value: 'tuition', label: 'Tuition' },
    { value: 'examination', label: 'Examination' },
    { value: 'library', label: 'Library' },
    { value: 'laboratory', label: 'Laboratory' },
    { value: 'clinical', label: 'Clinical' },
    { value: 'development', label: 'Development' },
    { value: 'hostel', label: 'Hostel' },
    { value: 'transport', label: 'Transport' },
    { value: 'misc', label: 'Misc' },
    { value: 'late_fee', label: 'Late Fee' }
  ];

  paymentModes = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'card', label: 'Card' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'demand_draft', label: 'Demand Draft' },
    { value: 'online', label: 'Online' }
  ];

  constructor(
    private feeService: FeeService,
    private notify: NotificationService,
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(q => {
      const sd = q.get('startDate');
      const ed = q.get('endDate');
      const ft = q.get('feeType');
      const pm = q.get('paymentMode');
      const min = q.get('minAmount');
      const max = q.get('maxAmount');
      const pi = q.get('page');
      const ps = q.get('limit');
      const sb = q.get('sortBy');
      const so = q.get('sortOrder');

      if (sd) this.startDate = new Date(sd);
      if (ed) this.endDate = new Date(ed);
      if (ft !== null) this.feeType = ft || '';
      if (pm !== null) this.paymentMode = pm || '';
      if (min !== null) this.minAmount = min ? +min : undefined;
      if (max !== null) this.maxAmount = max ? +max : undefined;
      if (pi) this.pageIndex = Math.max(0, +pi - 1);
      if (ps) this.pageSize = +ps;
      if (sb) this.sortBy = sb;
      if (so === 'asc' || so === 'desc') this.sortOrder = so;
      this.load();
    });
  }

  private fmt(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private updateQueryParams(): void {
    const queryParams: any = {
      startDate: this.fmt(this.startDate),
      endDate: this.fmt(this.endDate),
      feeType: this.feeType || null,
      paymentMode: this.paymentMode || null,
      minAmount: this.minAmount ?? null,
      maxAmount: this.maxAmount ?? null,
      page: this.pageIndex + 1,
      limit: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }

  load(): void {
    const filters: any = {
      startDate: this.fmt(this.startDate),
      endDate: this.fmt(this.endDate),
      feeType: this.feeType || undefined,
      paymentMode: this.paymentMode || undefined,
      minAmount: this.minAmount || undefined,
      maxAmount: this.maxAmount || undefined,
      page: this.pageIndex + 1,
      limit: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };
    this.loading.set(true);
    this.feeService.getAllPayments(filters).subscribe({
      next: (resp) => {
        const list = Array.isArray(resp) ? resp : (resp?.data || resp?.payments || []);
        this.rows.set(list);
        this.total = resp?.total || resp?.totalCount || resp?.pagination?.total || list.length;
        const totalAmount = list.reduce((s: number, r: any) => s + (r.amount || r.amountPaid || 0), 0);
        const count = list.length;
        const average = count > 0 ? Math.round(totalAmount / count) : 0;
        this.summary.set({ totalAmount: resp?.totalAmount || totalAmount, count: this.total, average });
        this.pageTotal.set(totalAmount);
        this.prefetchStudentNames(list);
        this.loading.set(false);
        this.updateQueryParams();
      },
      error: (err) => {
        console.error('Fee report load failed', err);
        this.notify.showError('Failed to load fee reports');
        this.loading.set(false);
      }
    });
  }

  reset(): void {
    this.startDate = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    this.endDate = new Date();
    this.feeType = '';
    this.paymentMode = '';
    this.minAmount = undefined;
    this.maxAmount = undefined;
    this.pageIndex = 0;
    this.sortBy = 'createdAt';
    this.sortOrder = 'desc';
    this.load();
  }

  exportCsv(): void {
    const filters = {
      startDate: this.fmt(this.startDate),
      endDate: this.fmt(this.endDate),
      feeType: this.feeType || undefined,
      paymentMode: this.paymentMode || undefined,
      minAmount: this.minAmount || undefined,
      maxAmount: this.maxAmount || undefined,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };
    this.loading.set(true);
    if (this.feeService.exportPaymentsCsv) {
      this.feeService.exportPaymentsCsv(filters).subscribe({
        next: (blob: Blob) => { this.downloadBlob(blob, 'fee_reports.csv'); this.loading.set(false); },
        error: () => { this.loading.set(false); this.exportCsvClient(); }
      });
    } else {
      this.loading.set(false);
      this.exportCsvClient();
    }
  }

  private exportCsvClient() {
    const data = this.rows();
    if (!data.length) { this.notify.showInfo('No data to export'); return; }
    const headers = ['Date','StudentId','FeeType','PaymentMode','Amount','Status'];
    const lines = data.map((r: any) => [
      new Date(r.createdAt).toISOString().slice(0,10),
      r.studentId,
      r.feeType || '',
      r.paymentMode || '',
      (r.amount || r.amountPaid || 0),
      r.status || 'success'
    ].join(','));
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, 'fee_reports.csv');
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  onSort(e: Sort): void {
    this.sortBy = e.active || 'createdAt';
    this.sortOrder = (e.direction as 'asc' | 'desc') || 'asc';
    this.load();
  }

  private prefetchStudentNames(list: any[]) {
    const ids = Array.from(new Set(list.map(r => r.studentId).filter(Boolean)));
    const missing = ids.filter(id => !this.studentNameCache.has(id)).slice(0, 20);
    missing.forEach(id => {
      this.studentService.getStudentById(id).subscribe({
        next: (s: any) => {
          const name = s?.name || [s?.firstName, s?.lastName].filter(Boolean).join(' ') || id;
          this.studentNameCache.set(id, name);
        },
        error: () => { /* ignore */ }
      });
    });
  }

  studentName(id: string): string { return this.studentNameCache.get(id) || id; }
}
