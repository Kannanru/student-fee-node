import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hall, ClassSession, AttendanceEvent, AttendanceSettings, EnhancedTimetable } from '../models/attendance-enhanced.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceEnhancedService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // ============ Hall Management ============
  
  createHall(hall: Hall): Observable<any> {
    return this.http.post(`${this.baseUrl}/halls`, hall);
  }

  getAllHalls(filters?: { isActive?: boolean; cameraStatus?: string; type?: string }): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      if (filters.isActive !== undefined) params = params.set('isActive', filters.isActive.toString());
      if (filters.cameraStatus) params = params.set('cameraStatus', filters.cameraStatus);
      if (filters.type) params = params.set('type', filters.type);
    }
    return this.http.get(`${this.baseUrl}/halls`, { params });
  }

  getHallById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/halls/${id}`);
  }

  updateHall(id: string, hall: Partial<Hall>): Observable<any> {
    return this.http.put(`${this.baseUrl}/halls/${id}`, hall);
  }

  deleteHall(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/halls/${id}`);
  }

  updateCameraStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/halls/${id}/camera-status`, { cameraStatus: status });
  }

  getHallOccupancy(date?: string): Observable<any> {
    const params = date ? new HttpParams().set('date', date) : new HttpParams();
    return this.http.get(`${this.baseUrl}/halls/occupancy`, { params });
  }

  // ============ Class Session Management ============
  
  createSession(session: ClassSession): Observable<any> {
    return this.http.post(`${this.baseUrl}/sessions`, session);
  }

  generateSessionsFromTimetable(data: { date: string; program?: string; year?: number; semester?: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/sessions/generate`, data);
  }

  getSessionsByDate(filters: { date: string; program?: string; year?: number; semester?: number; hallId?: string }): Observable<any> {
    let params = new HttpParams().set('date', filters.date);
    if (filters.program) params = params.set('program', filters.program);
    if (filters.year) params = params.set('year', filters.year.toString());
    if (filters.semester) params = params.set('semester', filters.semester.toString());
    if (filters.hallId) params = params.set('hallId', filters.hallId);
    return this.http.get(`${this.baseUrl}/sessions`, { params });
  }

  getOngoingSessions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sessions/ongoing`);
  }

  getSessionById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/sessions/${id}`);
  }

  getSessionAttendance(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/sessions/${id}/attendance`);
  }

  updateSessionStatus(id: string, status: string, cancellationReason?: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/sessions/${id}/status`, { status, cancellationReason });
  }

  deleteSession(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sessions/${id}`);
  }

  // ============ Camera Events ============
  
  getUnprocessedEvents(limit: number = 100): Observable<any> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get(`${this.baseUrl}/attendance/events/unprocessed`, { params });
  }

  getExceptionEvents(startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get(`${this.baseUrl}/attendance/events/exceptions`, { params });
  }

  getEventsBySession(sessionId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/attendance/events/session/${sessionId}`);
  }

  // ============ Attendance Settings ============
  
  createSettings(settings: AttendanceSettings): Observable<any> {
    return this.http.post(`${this.baseUrl}/attendance-settings`, settings);
  }

  getAllSettings(filters?: { department?: string; program?: string; isActive?: boolean }): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      if (filters.department) params = params.set('department', filters.department);
      if (filters.program) params = params.set('program', filters.program);
      if (filters.isActive !== undefined) params = params.set('isActive', filters.isActive.toString());
    }
    return this.http.get(`${this.baseUrl}/attendance-settings`, { params });
  }

  getApplicableSettings(department: string, program?: string, year?: number, semester?: number): Observable<any> {
    let params = new HttpParams().set('department', department);
    if (program) params = params.set('program', program);
    if (year) params = params.set('year', year.toString());
    if (semester) params = params.set('semester', semester.toString());
    return this.http.get(`${this.baseUrl}/attendance-settings/applicable`, { params });
  }

  updateSettings(id: string, settings: Partial<AttendanceSettings>): Observable<any> {
    return this.http.put(`${this.baseUrl}/attendance-settings/${id}`, settings);
  }

  deleteSettings(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/attendance-settings/${id}`);
  }

  setGlobalDefaults(settings: Partial<AttendanceSettings>): Observable<any> {
    return this.http.post(`${this.baseUrl}/attendance-settings/global`, settings);
  }

  // ============ Enhanced Timetable ============
  
  createTimetable(timetable: EnhancedTimetable): Observable<any> {
    return this.http.post(`${this.baseUrl}/timetable`, timetable);
  }

  getAllTimetables(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.set(key, filters[key].toString());
        }
      });
    }
    return this.http.get(`${this.baseUrl}/timetable`, { params });
  }

  updateTimetable(id: string, timetable: Partial<EnhancedTimetable>): Observable<any> {
    return this.http.put(`${this.baseUrl}/timetable/${id}`, timetable);
  }

  deleteTimetable(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/timetable/${id}`);
  }
}
