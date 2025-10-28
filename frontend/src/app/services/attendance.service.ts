// src/app/services/attendance.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  AttendanceRecord, 
  AttendanceRequest, 
  StudentDailyAttendance, 
  StudentAttendanceSummary,
  AdminDailyReport,
  OccupancyData
} from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  
  constructor(private apiService: ApiService) {}

  // Record Attendance
  recordAttendance(attendanceData: AttendanceRequest): Observable<AttendanceRecord> {
    return this.apiService.post<AttendanceRecord>('/attendance/record', attendanceData);
  }

  // Student Attendance Views
  getStudentDailyAttendance(studentId: string, date: string): Observable<StudentDailyAttendance> {
    return this.apiService.get<StudentDailyAttendance>(
      `/attendance/student/${studentId}/daily`, 
      { date }
    );
  }

  getStudentAttendanceSummary(
    studentId: string, 
    startDate: string, 
    endDate: string
  ): Observable<StudentAttendanceSummary> {
    return this.apiService.get<StudentAttendanceSummary>(
      `/attendance/student/${studentId}/summary`, 
      { startDate, endDate }
    );
  }

  // Admin Reports
  getAdminDailyReport(date: string): Observable<AdminDailyReport> {
    return this.apiService.get<AdminDailyReport>('/attendance/admin/daily', { date });
  }

  getAdminSummaryReport(startDate: string, endDate: string): Observable<any> {
    return this.apiService.get('/attendance/admin/summary', { startDate, endDate });
  }

  getAdminOccupancyReport(date: string): Observable<OccupancyData> {
    return this.apiService.get<OccupancyData>('/attendance/admin/occupancy', { date });
  }

  // Export Functions
  exportAttendanceCsv(startDate: string, endDate: string): Observable<Blob> {
    return this.apiService.get<Blob>(
      '/attendance/admin/export', 
      { startDate, endDate }
    );
  }

  exportAttendancePdf(date: string): Observable<Blob> {
    return this.apiService.get<Blob>('/attendance/admin/export.pdf', { date });
  }

  // Logs and Corrections
  getAttendanceLogs(): Observable<any[]> {
    return this.apiService.get<any[]>('/attendance/logs');
  }

  // Student Summary for Reports
  getStudentSummary(studentId: string, startDate: string, endDate: string): Observable<any> {
    return this.apiService.get(`/attendance/student/${studentId}/summary`, { startDate, endDate });
  }

  // Logs with filters
  getLogs(date: string, studentId?: string): Observable<any> {
    const params: any = { date };
    if (studentId) params.studentId = studentId;
    return this.apiService.get('/attendance/logs', params);
  }

  requestAttendanceCorrection(correctionData: any): Observable<any> {
    return this.apiService.post('/attendance/correction', correctionData);
  }

  reviewAttendanceCorrection(correctionId: string, reviewData: any): Observable<any> {
    return this.apiService.post(`/attendance/${correctionId}/correction/review`, reviewData);
  }

  // Real-time Attendance Stream
  getAttendanceStreamUrl(): string {
    const baseUrl = 'http://localhost:5000'; // Use environment later
    return `${baseUrl}/api/attendance/stream`;
  }

  // Utility Methods
  calculateAttendancePercentage(attended: number, total: number): number {
    return total > 0 ? Math.round((attended / total) * 100) : 0;
  }

  getAttendanceStatus(percentage: number): 'excellent' | 'good' | 'warning' | 'critical' {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 60) return 'warning';
    return 'critical';
  }

  formatAttendanceData(records: AttendanceRecord[]): any {
    return records.map(record => ({
      ...record,
      formattedDate: new Date(record.date).toLocaleDateString(),
      formattedTimeIn: record.timeIn ? new Date(record.timeIn).toLocaleTimeString() : '-',
      formattedTimeOut: record.timeOut ? new Date(record.timeOut).toLocaleTimeString() : '-',
      duration: this.calculateDuration(record.timeIn, record.timeOut)
    }));
  }

  private calculateDuration(timeIn?: string, timeOut?: string): string {
    if (!timeIn || !timeOut) return '-';
    
    const start = new Date(timeIn);
    const end = new Date(timeOut);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  }
}