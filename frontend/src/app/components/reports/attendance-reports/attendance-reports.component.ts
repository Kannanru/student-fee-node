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

import { AttendanceService } from '../../../services/attendance.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-attendance-reports',
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
    MatProgressSpinnerModule
  ],
  templateUrl: './attendance-reports.component.html',
  styleUrls: ['./attendance-reports.component.css']
})
export class AttendanceReportsComponent implements OnInit {
  loading = signal(false);
  rows = signal<any[]>([]);
  summary = signal<{ average: number; days: number; absences: number } | null>(null);

  startDate: Date = new Date(Date.now() - 14 * 24 * 3600 * 1000);
  endDate: Date = new Date();
  className = '';
  section = '';

  displayed = ['date', 'present', 'absent', 'percentage'];

  constructor(private attendanceService: AttendanceService, private notify: NotificationService) {}

  ngOnInit(): void {
    this.load();
  }

  private fmt(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  load(): void {
    const params: any = {
      startDate: this.fmt(this.startDate),
      endDate: this.fmt(this.endDate),
      className: this.className || undefined,
      section: this.section || undefined
    };
    this.loading.set(true);
    this.attendanceService.getAdminSummaryReport(params.startDate, params.endDate).subscribe({
      next: (resp) => {
        const list = Array.isArray(resp) ? resp : (resp?.data || resp?.summary || []);
        // Normalize rows
        const rows = list.map((d: any) => ({
          date: d.date || d.day || d._id || new Date().toISOString(),
          present: d.present || d.presentCount || 0,
          absent: d.absent || d.absentCount || 0,
          percentage: d.percentage != null ? d.percentage : (d.present && d.total ? (d.present / d.total) * 100 : 0)
        }));
        this.rows.set(rows);
  const days = rows.length;
  const totalPresent = rows.reduce((s: number, r: any) => s + (r.present || 0), 0);
  const total = rows.reduce((s: number, r: any) => s + ((r.present || 0) + (r.absent || 0)), 0);
        const avg = total > 0 ? (totalPresent / total) * 100 : 0;
  const absences = rows.reduce((s: number, r: any) => s + (r.absent || 0), 0);
        this.summary.set({ average: +avg.toFixed(2), days, absences });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Attendance report load failed', err);
        this.notify.showError('Failed to load attendance reports');
        this.loading.set(false);
      }
    });
  }

  reset(): void {
    this.startDate = new Date(Date.now() - 14 * 24 * 3600 * 1000);
    this.endDate = new Date();
    this.className = '';
    this.section = '';
    this.load();
  }

  exportCsv(): void {
    const data = this.rows();
    if (!data.length) { this.notify.showInfo('No data to export'); return; }
    const headers = ['Date','Present','Absent','Percentage'];
    const lines = data.map(r => [
      new Date(r.date).toISOString().slice(0,10), r.present, r.absent, r.percentage
    ].join(','));
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'attendance_reports.csv'; a.click();
    URL.revokeObjectURL(url);
  }
}
