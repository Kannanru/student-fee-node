import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClient } from '@angular/common/http';
import { SocketService, AttendanceEventData } from '../../../services/socket.service';
import { Subscription } from 'rxjs';

interface StudentStatus {
  studentId: string;
  name: string;
  rollNumber: string;
  status: 'Pending' | 'In' | 'Out' | 'Absent' | 'Leave';
  lastUpdated?: Date;
  hallName?: string;
  onLeave?: boolean;
  leaveReason?: string;
}

interface SessionInfo {
  subject: string;
  hallName: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  faculty: string;
}

@Component({
  selector: 'app-realtime-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './realtime-dashboard.component.html',
  styleUrl: './realtime-dashboard.component.css'
})
export class RealtimeDashboardComponent implements OnInit, OnDestroy {
  // Connection status
  isConnected = false;
  
  // Class selection
  selectedProgram: string = '';
  selectedYear: string = '';
  
  programs = ['BDS', 'MDS'];
  years = ['1', '2', '3', '4'];
  
  // Session info
  currentSession: SessionInfo | null = null;
  
  // Student status tracking
  studentStatuses = new MatTableDataSource<StudentStatus>([]);
  studentColumns = ['rollNumber', 'name', 'status', 'lastUpdated'];
  
  // Statistics
  classStats = {
    total: 0,
    present: 0,
    out: 0,
    absent: 0,
    pending: 0,
    onLeave: 0
  };

  private subscriptions: Subscription[] = [];
  private absentCheckInterval: any;

  constructor(
    private socketService: SocketService,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Connect to Socket.IO
    this.socketService.connect();
    
    // Subscribe to connection status
    this.subscriptions.push(
      this.socketService.connected$.subscribe(connected => {
        this.isConnected = connected;
        if (connected) {
          this.snackBar.open('✅ Real-time updates connected', 'Close', { duration: 3000 });
          this.socketService.joinDashboard();
          this.socketService.joinAttendanceStream();
        } else {
          this.snackBar.open('❌ Real-time updates disconnected', 'Close', { duration: 3000 });
        }
      })
    );

    // Subscribe to attendance events
    this.subscriptions.push(
      this.socketService.onAttendanceEvent().subscribe(event => {
        this.handleAttendanceEvent(event);
      })
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Clear absent check interval
    if (this.absentCheckInterval) {
      clearInterval(this.absentCheckInterval);
    }
    
    // Disconnect socket
    this.socketService.disconnect();
  }

  onClassSelectionChange(): void {
    if (this.selectedProgram && this.selectedYear) {
      this.loadClassStudents();
      this.loadCurrentSession();
    }
  }

  loadClassStudents(): void {
    const url = `http://localhost:5000/api/students?programName=${this.selectedProgram}&year=${this.selectedYear}&limit=100`;
    
    this.http.get<any>(url).subscribe({
      next: (response) => {
        const students = response.data || [];
        const studentStatuses: StudentStatus[] = students.map((student: any) => ({
          studentId: student.studentId,
          name: `${student.firstName} ${student.lastName}`,
          rollNumber: student.rollNumber || student.studentId,
          status: 'Pending' as const
        }));
        
        this.studentStatuses.data = studentStatuses;
        this.updateClassStats();
        
        // Load students on leave
        this.loadStudentsOnLeave();
        
        // Start absent check after 10 minutes of session start
        this.startAbsentCheck();
        
        this.snackBar.open(`Loaded ${students.length} students`, 'Close', { duration: 2000 });
      },
      error: (err) => {
        console.error('Error loading students:', err);
        this.snackBar.open('Error loading students', 'Close', { duration: 3000 });
      }
    });
  }

  loadCurrentSession(): void {
    const url = `http://localhost:5000/api/timetable/current?programName=${this.selectedProgram}&year=${this.selectedYear}`;
    
    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentSession = {
            subject: response.data.subject,
            hallName: response.data.hallName || 'N/A',
            periodNumber: response.data.periodNumber,
            startTime: response.data.startTime,
            endTime: response.data.endTime,
            faculty: response.data.faculty
          };
        } else {
          this.currentSession = null;
        }
      },
      error: (err) => {
        console.error('Error loading session:', err);
        this.currentSession = null;
      }
    });
  }

  handleAttendanceEvent(event: AttendanceEventData): void {
    console.log('New attendance event:', event);
    
    // Only process if event matches selected class
    if (!event.student || 
        event.student.program !== this.selectedProgram || 
        event.student.year?.toString() !== this.selectedYear) {
      return;
    }
    
    // Update student status
    const students = this.studentStatuses.data;
    const studentIndex = students.findIndex(s => s.studentId === event.student?.id);
    
    if (studentIndex !== -1) {
      if (event.direction === 'IN') {
        students[studentIndex].status = 'In';
      } else if (event.direction === 'OUT') {
        students[studentIndex].status = 'Out';
      }
      students[studentIndex].lastUpdated = new Date(event.timestamp);
      students[studentIndex].hallName = event.hall?.name;
      
      this.studentStatuses.data = [...students];
      this.updateClassStats();
      
      // Show notification
      this.snackBar.open(
        `${event.student.name} - ${event.direction}`,
        'Close',
        { duration: 2000 }
      );
    }
  }

  startAbsentCheck(): void {
    // Clear existing interval
    if (this.absentCheckInterval) {
      clearInterval(this.absentCheckInterval);
    }
    
    // Check every minute for students who should be marked absent
    this.absentCheckInterval = setInterval(() => {
      this.checkAbsentStudents();
    }, 60000); // 1 minute
  }

  checkAbsentStudents(): void {
    if (!this.currentSession) return;
    
    const now = new Date();
    const sessionStartTime = new Date();
    const [hours, minutes] = this.currentSession.startTime.split(':');
    sessionStartTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const tenMinutesAfterStart = new Date(sessionStartTime.getTime() + 10 * 60000);
    
    // If current time is more than 10 minutes after session start
    if (now > tenMinutesAfterStart) {
      const students = this.studentStatuses.data;
      let updated = false;
      
      students.forEach(student => {
        if (student.status === 'Pending') {
          student.status = 'Absent';
          updated = true;
        }
      });
      
      if (updated) {
        this.studentStatuses.data = [...students];
        this.updateClassStats();
      }
    }
  }

  updateClassStats(): void {
    const students = this.studentStatuses.data;
    this.classStats.total = students.length;
    this.classStats.present = students.filter(s => s.status === 'In').length;
    this.classStats.out = students.filter(s => s.status === 'Out').length;
    this.classStats.absent = students.filter(s => s.status === 'Absent').length;
    this.classStats.pending = students.filter(s => s.status === 'Pending').length;
    this.classStats.onLeave = students.filter(s => s.status === 'Leave').length;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'In': return 'primary';
      case 'Out': return 'accent';
      case 'Absent': return 'warn';
      case 'Leave': return 'accent';
      case 'Pending': return '';
      default: return '';
    }
  }

  getStatusTextColor(status: string): string {
    switch (status) {
      case 'In': return '#4caf50';
      case 'Out': return '#2196f3';
      case 'Absent': return '#f44336';
      case 'Leave': return '#ff9800';
      case 'Pending': return '#9e9e9e';
      default: return '#000';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'In': return 'login';
      case 'Out': return 'logout';
      case 'Absent': return 'cancel';
      case 'Leave': return 'event_busy';
      case 'Pending': return 'schedule';
      default: return 'help';
    }
  }

  formatTimestamp(timestamp?: Date): string {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }

  loadStudentsOnLeave(): void {
    const today = new Date().toISOString().split('T')[0];
    const url = `http://localhost:5000/api/leave/on-leave?date=${today}&programName=${this.selectedProgram}&year=${this.selectedYear}`;
    
    console.log('Loading students on leave for:', { date: today, program: this.selectedProgram, year: this.selectedYear });
    
    this.http.get<any>(url).subscribe({
      next: (response) => {
        console.log('Leave API response:', response);
        
        if (response.success && response.students && response.students.length > 0) {
          const students = this.studentStatuses.data;
          let updated = false;
          
          response.students.forEach((leaveStudent: any) => {
            console.log('Checking leave student:', leaveStudent);
            
            // Try multiple matching strategies
            const studentIndex = students.findIndex(s => {
              const match = 
                s.studentId === leaveStudent.studentId || 
                s.studentId === leaveStudent.studentRegisterNumber ||
                s.rollNumber === leaveStudent.studentRegisterNumber ||
                s.rollNumber === leaveStudent.studentId ||
                s.name.toLowerCase() === leaveStudent.studentName?.toLowerCase();
              
              if (match) {
                console.log('Match found:', s.name, 'with', leaveStudent.studentName);
              }
              return match;
            });
            
            if (studentIndex !== -1) {
              console.log('Marking as Leave:', students[studentIndex].name);
              students[studentIndex].status = 'Leave';
              students[studentIndex].onLeave = true;
              students[studentIndex].leaveReason = leaveStudent.reason;
              updated = true;
            } else {
              console.warn('No match found for leave student:', leaveStudent.studentName);
            }
          });
          
          if (updated) {
            this.studentStatuses.data = [...students];
            this.updateClassStats();
            this.snackBar.open(`${response.students.length} student(s) on leave today`, 'Close', { duration: 3000 });
          }
        } else {
          console.log('No students on leave or empty response');
        }
      },
      error: (err) => {
        console.error('Error loading students on leave:', err);
      }
    });
  }

  reconnect(): void {
    this.socketService.disconnect();
    setTimeout(() => {
      this.socketService.connect();
      this.socketService.joinDashboard();
      this.socketService.joinAttendanceStream();
    }, 1000);
  }
}
