import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

import { AttendanceService } from '../../../services/attendance.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-attendance-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  MatFormFieldModule,
  MatInputModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './attendance-dashboard.component.html',
  styleUrls: ['./attendance-dashboard.component.css']
})
export class AttendanceDashboardComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api';
  
  // Signals/state
  loading = signal(false);
  selectedDate = signal<Date>(new Date());
  dailyReport = signal<any>(null);
  summary = signal<any>(null);
  occupancy = signal<any>(null);
  
  // Settings
  showSettings = signal(false);
  savingThreshold = signal(false);
  lateThreshold = 10; // Default value

  displayedColumns: string[] = ['class', 'present', 'absent', 'late', 'percentage'];

  constructor(
    private attendanceService: AttendanceService,
    private notify: NotificationService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.refreshAll();
    this.loadLateThreshold();
  }

  refreshAll(): void {
    const dateStr = this.formatDate(this.selectedDate());
    this.loading.set(true);

    // Daily report
    this.attendanceService.getAdminDailyReport(dateStr).subscribe({
      next: (data) => this.dailyReport.set(data),
      error: () => this.dailyReport.set(this.sampleDailyReport())
    });

    // Summary last 30 days
    const endDate = dateStr;
    const startDate = this.formatDate(new Date(Date.now() - 29 * 24 * 3600 * 1000));
    this.attendanceService.getAdminSummaryReport(startDate, endDate).subscribe({
      next: (data) => this.summary.set(data),
      error: () => this.summary.set(this.sampleSummary())
    });

    // Occupancy
    this.attendanceService.getAdminOccupancyReport(dateStr).subscribe({
      next: (data) => {
        this.occupancy.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.occupancy.set(this.sampleOccupancy());
        this.loading.set(false);
      }
    });
  }

  onDateChange(date: Date | null): void {
    if (!date) { return; }
    this.selectedDate.set(date);
    this.refreshAll();
  }

  exportCsv(): void {
    const endDate = this.formatDate(this.selectedDate());
    const startDate = this.formatDate(new Date(Date.now() - 29 * 24 * 3600 * 1000));
    this.attendanceService.exportAttendanceCsv(startDate, endDate).subscribe({
      next: (blob) => this.downloadBlob(blob, `attendance_${startDate}_${endDate}.csv`),
      error: () => this.notify.showInfo('CSV export requires backend; using mock mode right now.')
    });
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }

  formatDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Settings methods
  toggleSettings(): void {
    this.showSettings.set(!this.showSettings());
  }

  loadLateThreshold(): void {
    this.http.get<any>(`${this.apiUrl}/settings/late-threshold`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.lateThreshold = response.data.value;
        }
      },
      error: (error) => {
        console.error('Error loading late threshold:', error);
      }
    });
  }

  validateThreshold(): void {
    if (this.lateThreshold < 0) {
      this.lateThreshold = 0;
    } else if (this.lateThreshold > 60) {
      this.lateThreshold = 60;
    }
  }

  saveThreshold(): void {
    this.validateThreshold();
    
    this.savingThreshold.set(true);
    this.http.put<any>(`${this.apiUrl}/settings/late-threshold`, { value: this.lateThreshold }).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(
            `Late threshold updated to ${this.lateThreshold} minutes`, 
            'Close', 
            { duration: 3000 }
          );
        }
        this.savingThreshold.set(false);
      },
      error: (error) => {
        console.error('Error saving threshold:', error);
        this.snackBar.open('Failed to save threshold', 'Close', { duration: 3000 });
        this.savingThreshold.set(false);
      }
    });
  }

  // Sample fallback data to keep UI useful in mock mode
  private sampleDailyReport() {
    return {
      date: this.selectedDate(),
      totalStudents: 480,
      present: 432,
      absent: 40,
      late: 8,
      byClass: [
        { class: 'BDS 1st Year', present: 110, absent: 8, late: 2, percentage: 92 },
        { class: 'BDS 2nd Year', present: 105, absent: 10, late: 3, percentage: 89 },
        { class: 'BDS 3rd Year', present: 110, absent: 6, late: 2, percentage: 94 },
        { class: 'BDS 4th Year', present: 107, absent: 16, late: 1, percentage: 85 }
      ]
    };
  }

  private sampleSummary() {
    return {
      range: 'Last 30 days',
      averagePercentage: 88,
      bestDay: { date: '2025-09-05', percentage: 94 },
      worstDay: { date: '2025-09-18', percentage: 79 }
    };
  }

  private sampleOccupancy() {
    return {
      date: this.selectedDate(),
      rooms: [
        { room: 'Anatomy Lab', capacity: 60, occupied: 54 },
        { room: 'Physiology Lab', capacity: 60, occupied: 50 },
        { room: 'Lecture Hall A', capacity: 120, occupied: 108 },
        { room: 'Lecture Hall B', capacity: 120, occupied: 98 }
      ]
    };
  }
}
