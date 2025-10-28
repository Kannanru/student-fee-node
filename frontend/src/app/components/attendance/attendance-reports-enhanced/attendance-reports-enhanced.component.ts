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
import { AttendanceEnhancedService } from '../../../services/attendance-enhanced.service';
import { AttendanceService } from '../../../services/attendance.service';

@Component({
  selector: 'app-attendance-reports-enhanced',
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
  templateUrl: './attendance-reports-enhanced.component.html',
  styleUrl: './attendance-reports-enhanced.component.css'
})
export class AttendanceReportsEnhancedComponent implements OnInit {
  // Forms
  dailyReportForm: FormGroup;
  studentReportForm: FormGroup;
  departmentReportForm: FormGroup;
  periodReportForm: FormGroup;
  exceptionReportForm: FormGroup;
  logsReportForm: FormGroup;

  // Data
  reportData: any[] = [];
  loading = false;
  currentReportType = '';

  // Table columns
  dailyColumns = ['studentName', 'studentId', 'subject', 'hall', 'timeIn', 'timeOut', 'duration', 'status'];
  studentColumns = ['date', 'subject', 'hall', 'timeIn', 'timeOut', 'duration', 'status', 'billNumber'];
  departmentColumns = ['program', 'year', 'semester', 'totalStudents', 'present', 'late', 'absent', 'percentage'];
  periodColumns = ['periodNumber', 'subject', 'hall', 'faculty', 'totalExpected', 'present', 'late', 'absent', 'percentage'];
  exceptionColumns = ['timestamp', 'studentId', 'hall', 'direction', 'confidence', 'spoofScore', 'status', 'reason'];
  logsColumns = ['timestamp', 'studentName', 'studentId', 'hall', 'direction', 'confidence', 'cameraId'];

  // Options
  programs = ['BDS', 'MBBS', 'MD', 'MS'];
  years = [1, 2, 3, 4, 5];
  semesters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  statusOptions = ['Present', 'Late', 'Absent', 'Early Leave'];

  constructor(
    private attendanceEnhancedService: AttendanceEnhancedService,
    private attendanceService: AttendanceService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    const today = new Date();
    
    this.dailyReportForm = this.fb.group({
      date: [today],
      program: [''],
      year: [null],
      semester: [null]
    });

    this.studentReportForm = this.fb.group({
      studentId: [''],
      startDate: [new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)],
      endDate: [today]
    });

    this.departmentReportForm = this.fb.group({
      program: ['BDS'],
      year: [1],
      semester: [1],
      startDate: [new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)],
      endDate: [today]
    });

    this.periodReportForm = this.fb.group({
      date: [today],
      program: [''],
      hallId: ['']
    });

    this.exceptionReportForm = this.fb.group({
      startDate: [today],
      endDate: [today]
    });

    this.logsReportForm = this.fb.group({
      date: [today],
      studentId: [''],
      hallId: ['']
    });
  }

  ngOnInit(): void {}

  // Daily Attendance Report
  generateDailyReport(): void {
    this.loading = true;
    this.currentReportType = 'daily';
    const filters = this.dailyReportForm.value;
    const dateStr = this.formatDate(filters.date);

    this.attendanceEnhancedService.getSessionsByDate({
      date: dateStr,
      program: filters.program || undefined,
      year: filters.year || undefined,
      semester: filters.semester || undefined
    }).subscribe({
      next: (response: any) => {
        // Get attendance records for all sessions
        const sessionIds = response.data.map((s: any) => s._id);
        this.loadAttendanceForSessions(sessionIds);
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.snackBar.open('Failed to generate report', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadAttendanceForSessions(sessionIds: string[]): void {
    const requests = sessionIds.map(id => 
      this.attendanceEnhancedService.getSessionAttendance(id).toPromise()
    );

    Promise.all(requests).then((responses: any[]) => {
      this.reportData = [];
      responses.forEach(resp => {
        if (resp.attendanceRecords) {
          this.reportData.push(...resp.attendanceRecords.map((record: any) => ({
            studentName: record.studentRef?.studentName || 'N/A',
            studentId: record.studentRef?.studentId || 'N/A',
            subject: record.className,
            hall: record.hallId?.hallName || 'N/A',
            timeIn: record.timeIn,
            timeOut: record.timeOut,
            duration: record.duration || 0,
            status: record.status
          })));
        }
      });
      this.loading = false;
    }).catch(error => {
      console.error('Error loading attendance:', error);
      this.snackBar.open('Error loading attendance data', 'Close', { duration: 3000 });
      this.loading = false;
    });
  }

  // Student Attendance Report
  generateStudentReport(): void {
    this.loading = true;
    this.currentReportType = 'student';
    const filters = this.studentReportForm.value;

    // Call existing attendance service
    this.attendanceService.getStudentSummary(
      filters.studentId,
      this.formatDate(filters.startDate),
      this.formatDate(filters.endDate)
    ).subscribe({
      next: (response: any) => {
        this.reportData = response.data || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.snackBar.open('Failed to generate student report', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // Department-wise Report
  generateDepartmentReport(): void {
    this.loading = true;
    this.currentReportType = 'department';
    const filters = this.departmentReportForm.value;

    // Aggregate by calling daily reports for date range
    this.reportData = [
      {
        program: filters.program,
        year: filters.year,
        semester: filters.semester,
        totalStudents: 0,
        present: 0,
        late: 0,
        absent: 0,
        percentage: 0
      }
    ];
    this.loading = false;
    this.snackBar.open('Department report generated (demo data)', 'Close', { duration: 3000 });
  }

  // Period-wise Report
  generatePeriodReport(): void {
    this.loading = true;
    this.currentReportType = 'period';
    const filters = this.periodReportForm.value;
    const dateStr = this.formatDate(filters.date);

    this.attendanceEnhancedService.getSessionsByDate({
      date: dateStr,
      program: filters.program || undefined,
      hallId: filters.hallId || undefined
    }).subscribe({
      next: (response: any) => {
        this.reportData = response.data.map((session: any) => ({
          periodNumber: session.periodNumber,
          subject: session.subject,
          hall: session.hallId?.hallName || 'N/A',
          faculty: session.facultyName || 'N/A',
          totalExpected: session.totalExpected,
          present: session.totalPresent,
          late: session.totalLate,
          absent: session.totalAbsent,
          percentage: session.totalExpected > 0 
            ? Math.round((session.totalPresent / session.totalExpected) * 100) 
            : 0
        }));
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.snackBar.open('Failed to generate period report', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // Exception Report
  generateExceptionReport(): void {
    this.loading = true;
    this.currentReportType = 'exception';
    const filters = this.exceptionReportForm.value;

    this.attendanceEnhancedService.getExceptionEvents(
      this.formatDate(filters.startDate),
      this.formatDate(filters.endDate)
    ).subscribe({
      next: (response: any) => {
        this.reportData = response.data.map((event: any) => ({
          timestamp: event.timestamp,
          studentId: event.studentRegNo,
          hall: event.hallId?.hallName || 'N/A',
          direction: event.direction,
          confidence: event.confidence,
          spoofScore: event.spoofScore,
          status: event.processingStatus,
          reason: event.rejectionReason || 'N/A'
        }));
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.snackBar.open('Failed to generate exception report', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // Logs Report
  generateLogsReport(): void {
    this.loading = true;
    this.currentReportType = 'logs';
    const filters = this.logsReportForm.value;

    this.attendanceService.getLogs(
      this.formatDate(filters.date),
      filters.studentId || undefined
    ).subscribe({
      next: (response: any) => {
        this.reportData = response.data || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.snackBar.open('Failed to generate logs report', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // Export functions
  exportToCSV(): void {
    if (this.reportData.length === 0) {
      this.snackBar.open('No data to export', 'Close', { duration: 2000 });
      return;
    }

    const headers = this.getHeadersForCurrentReport();
    const csv = this.convertToCSV(this.reportData, headers);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.currentReportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    this.snackBar.open('Report exported successfully', 'Close', { duration: 2000 });
  }

  exportToPDF(): void {
    this.snackBar.open('PDF export will be implemented soon', 'Close', { duration: 2000 });
  }

  exportToExcel(): void {
    this.snackBar.open('Excel export will be implemented soon', 'Close', { duration: 2000 });
  }

  // Helper methods
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getHeadersForCurrentReport(): string[] {
    switch (this.currentReportType) {
      case 'daily': return this.dailyColumns;
      case 'student': return this.studentColumns;
      case 'department': return this.departmentColumns;
      case 'period': return this.periodColumns;
      case 'exception': return this.exceptionColumns;
      case 'logs': return this.logsColumns;
      default: return [];
    }
  }

  convertToCSV(data: any[], headers: string[]): string {
    const headerRow = headers.join(',');
    const dataRows = data.map(row => 
      headers.map(header => {
        let value = row[header];
        if (value instanceof Date) {
          value = value.toISOString();
        }
        return `"${value || ''}"`;
      }).join(',')
    );
    return [headerRow, ...dataRows].join('\n');
  }

  getDisplayColumns(): string[] {
    switch (this.currentReportType) {
      case 'daily': return this.dailyColumns;
      case 'student': return this.studentColumns;
      case 'department': return this.departmentColumns;
      case 'period': return this.periodColumns;
      case 'exception': return this.exceptionColumns;
      case 'logs': return this.logsColumns;
      default: return [];
    }
  }
}
