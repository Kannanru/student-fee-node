// src/app/components/students/student-detail/student-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';

import { StudentService } from '../../../services/student.service';
import { FeeService } from '../../../services/fee.service';
import { NotificationService } from '../../../services/notification.service';
import { SharedService } from '../../../services/shared.service';
import { Student } from '../../../models/student.model';
import { FeeRecord } from '../../../models/fee.model';
import { AchievementDialogComponent } from '../../achievements/achievement-dialog/achievement-dialog.component';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatMenuModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSelectModule
  ],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.css'
})
export class StudentDetailComponent implements OnInit {
  student: Student | null = null;
  feeRecords: FeeRecord[] = [];
  loading = false;
  loadingFeeRecords = false;
  studentId: string | null = null;
  // Aggregated fine total for selected semester
  semesterFineTotal: number = 0;
  
  // Make Math available in template
  Math = Math;
  
  // Semester-wise fee tracking
  semesters: number[] = [];
  selectedSemester: number | null = null;
  semesterFeeHeads: any[] = [];
  displayedColumns: string[] = ['name', 'amount', 'fineAmount', 'status', 'billNumber', 'paidDate'];
  
  // Leave records
  leaveRecords: any[] = [];
  loadingLeaveRecords = false;
  leaveDisplayedColumns: string[] = ['dates', 'days', 'type', 'reason', 'status', 'approvedBy'];
  
  // Attendance records
  attendanceRecords: any[] = [];
  loadingAttendanceRecords = false;
  selectedAttendanceDate: Date = new Date();
  maxDate: Date = new Date();
  attendanceDisplayedColumns: string[] = ['period', 'time', 'subject', 'hall', 'status', 'remarks'];
  currentTime: Date = new Date();
  
  // Internal Marks (year-based: 1,2,3...)
  selectedAcademicYear: number = 1;
  internalMarksData: any = null;
  loadingInternalMarks = false;
  marksColumns: string[] = ['subjectCode', 'subjectName', 'maxMarks', 'marksObtained', 'percentage', 'grade', 'actions'];
  
  // Achievements
  achievements: any[] = [];
  loadingAchievements = false;
  
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private studentService: StudentService,
    private feeService: FeeService,
    private notificationService: NotificationService,
    private http: HttpClient,
    private sharedService: SharedService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.studentId = params['id'];
        this.loadStudentDetails();
        this.loadFeeRecords();
        this.loadLeaveRecords();
        this.loadAttendanceRecords();
        this.loadAchievements();
      }
    });
  }

  // Helper to format year label
  getYearLabel(y: number): string {
    if (!y && y !== 0) return 'Year';
    const suffix = (n: number) => {
      if (n === 1) return 'st';
      if (n === 2) return 'nd';
      if (n === 3) return 'rd';
      return 'th';
    };
    return `${y}${suffix(y)} Year`;
  }

  loadStudentDetails() {
    if (!this.studentId) return;

    this.loading = true;
    console.log('Loading student details for ID:', this.studentId);
    this.studentService.getStudentById(this.studentId).subscribe({
      next: (student) => {
        console.log('Student data received:', student);
        this.student = student;
        this.loading = false;
        
        // Initialize semesters based on student program
        // Typically medical programs have 8-10 semesters
        this.semesters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        
        // Auto-select current semester if available, otherwise select semester 1
        if (student.semester) {
          this.selectedSemester = student.semester;
          console.log('Auto-selecting student current semester:', student.semester);
        } else {
          this.selectedSemester = 1;
          console.log('Student has no semester field, defaulting to semester 1');
        }
        
        // Load fee heads for selected semester
        this.loadSemesterFeeHeads();
      },
      error: (error) => {
        console.error('Error loading student:', error);
        this.notificationService.showError('Failed to load student details');
        this.router.navigate(['/students']);
      }
    });
  }

  loadFeeRecords() {
    if (!this.studentId) return;

    this.feeService.getStudentFeeRecords(this.studentId).subscribe({
      next: (records) => {
        // Ensure feeRecords is always an array
        this.feeRecords = Array.isArray(records) ? records : [];
      },
      error: (error) => {
        console.error('Error loading fee records:', error);
        // Set to empty array on error
        this.feeRecords = [];
      }
    });
  }

  editStudent() {
    if (this.student) {
      this.router.navigate(['/students', this.student._id, 'edit']);
    }
  }

  deleteStudent() {
    if (!this.student) return;

    const studentName = `${this.student.firstName} ${this.student.lastName}`;
    const confirmed = confirm(`Are you sure you want to delete student ${studentName}? This action cannot be undone.`);
    if (confirmed) {
      this.studentService.deleteStudent(this.student._id!).subscribe({
        next: () => {
          this.notificationService.showSuccess('Student deleted successfully');
          this.router.navigate(['/students']);
        },
        error: (error) => {
          console.error('Error deleting student:', error);
          this.notificationService.showError('Failed to delete student');
        }
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#4CAF50';
      case 'inactive':
        return '#FF9800';
      case 'suspended':
        return '#F44336';
      case 'graduated':
        return '#2196F3';
      default:
        return '#757575';
    }
  }

  getAge(): number | null {
    if (!this.student?.dob) return null;
    const today = new Date();
    const birthDate = new Date(this.student.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getTotalFees(): number {
    if (!Array.isArray(this.feeRecords) || this.feeRecords.length === 0) {
      return 0;
    }
    return this.feeRecords.reduce((total, record) => total + (record.totalAmount || 0), 0);
  }

  getPaidFees(): number {
    if (!Array.isArray(this.feeRecords) || this.feeRecords.length === 0) {
      return 0;
    }
    return this.feeRecords.reduce((total, record) => total + (record.paidAmount || 0), 0);
  }

  getPendingFees(): number {
    return this.getTotalFees() - this.getPaidFees();
  }

  // Semester-wise fee methods
  selectSemester(semester: number): void {
    this.selectedSemester = semester;
    this.loadSemesterFeeHeads();
  }

  loadSemesterFeeHeads(): void {
    if (!this.studentId || !this.selectedSemester) {
      console.log('Cannot load semester fees - missing studentId or selectedSemester');
      return;
    }

    this.loadingFeeRecords = true;
    console.log(`Loading semester ${this.selectedSemester} fees for student ${this.studentId}`);
    
    // Load fee structures for this student and semester
    this.feeService.getStudentSemesterFees(this.studentId, this.selectedSemester).subscribe({
      next: (response: any) => {
        console.log('Semester fees response:', response);
        if (response.success && response.data) {
          this.semesterFeeHeads = response.data;
          this.semesterFineTotal = response.meta?.totalFinePaid || 0;
          console.log(`Loaded ${this.semesterFeeHeads.length} fee heads for semester ${this.selectedSemester}`);
        } else {
          this.semesterFeeHeads = [];
          this.semesterFineTotal = 0;
          console.log('No fee heads in response');
        }
        this.loadingFeeRecords = false;
      },
      error: (error: any) => {
        console.error('Error loading semester fees:', error);
        console.error('Error details:', error.error);
        this.semesterFeeHeads = [];
        this.semesterFineTotal = 0;
        this.loadingFeeRecords = false;
      }
    });
  }

  getSemesterTotal(): number {
    return this.semesterFeeHeads.reduce((sum, head) => 
      sum + (head.totalAmount || head.amount || 0) + (head.fineAmount || 0), 0
    );
  }

  getSemesterPaid(): number {
    return this.semesterFeeHeads
      .filter(head => head.isPaid)
      .reduce((sum, head) => sum + (head.paidAmount || 0) + (head.fineAmount || 0), 0);
  }

  getSemesterPending(): number {
    return this.getSemesterTotal() - this.getSemesterPaid();
  }

  getSemesterFineTotal(): number {
    return this.semesterFeeHeads
      .filter(head => head.isPaid && head.fineAmount)
      .reduce((sum, head) => sum + (head.fineAmount || 0), 0);
  }

  goBack() {
    this.router.navigate(['/students']);
  }
  
  // Leave Management Methods
  loadLeaveRecords(): void {
    if (!this.studentId) return;
    
    console.log('Loading leave records for student:', this.studentId);
    this.loadingLeaveRecords = true;
    this.http.get<any>(`${this.apiUrl}/leave/student/${this.studentId}`).subscribe({
      next: (response) => {
        console.log('Leave records response:', response);
        this.leaveRecords = response.leaves || [];
        console.log('Leave records loaded:', this.leaveRecords.length);
        this.loadingLeaveRecords = false;
      },
      error: (error) => {
        console.error('Error loading leave records:', error);
        this.leaveRecords = [];
        this.loadingLeaveRecords = false;
      }
    });
  }
  
  getLeaveStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  }
  
  formatLeaveDate(date: string | Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  // Attendance Management Methods
  loadAttendanceRecords(): void {
    if (!this.student) return;
    
    this.currentTime = new Date();
    const dateStr = this.selectedAttendanceDate.toISOString().split('T')[0];
    const dayOfWeek = this.selectedAttendanceDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    const dayName = this.selectedAttendanceDate.toLocaleDateString('en-US', { weekday: 'long' });
    const isToday = dateStr === new Date().toISOString().split('T')[0];
    console.log('Loading attendance for:', dateStr, 'Day:', dayName, 'Day of Week:', dayOfWeek, 'Is Today:', isToday);
    
    this.loadingAttendanceRecords = true;
    
    // Extract year from semester (semester 1-2 = Year 1, semester 3-4 = Year 2)
    const year = Math.ceil(this.student.semester / 2);
    const section = this.student.section || 'A';
    
    // Get timetable for the student's class with dayOfWeek filter
    // Query: programName, year, dayOfWeek (semester and section optional)
    const timetableUrl = `${this.apiUrl}/timetable?programName=${this.student.programName}&year=${year}&dayOfWeek=${dayOfWeek}`;
    console.log('Fetching timetable from:', timetableUrl);
    
    // Get attendance records for the date
    const attendanceUrl = `${this.apiUrl}/attendance/student/${this.student._id}/daily?date=${dateStr}`;
    console.log('Fetching attendance from:', attendanceUrl);
    
    // Get leave records for the date
    const leaveUrl = `${this.apiUrl}/leave/on-leave?date=${dateStr}`;
    
    // Fetch all data in parallel
    Promise.all([
      this.http.get<any>(timetableUrl).toPromise(),
      this.http.get<any>(attendanceUrl).toPromise(),
      this.http.get<any>(leaveUrl).toPromise()
    ]).then(([timetableResponse, attendanceResponse, leaveResponse]) => {
      console.log('Timetable response:', timetableResponse);
      console.log('Attendance response:', attendanceResponse);
      console.log('Leave response:', leaveResponse);
      
      let periods = timetableResponse.data || [];
      const attendanceData = attendanceResponse.data || [];
      const leaveData = leaveResponse.students || [];
      
      // Check if student is on leave (compare both _id and studentId fields)
      console.log('Leave data received:', leaveData);
      console.log('Current student ID:', this.student!._id);
      const isOnLeave = leaveData.some((l: any) => {
        // Check multiple possible ID fields
        return l.studentId === this.student!._id || 
               l._id === this.student!._id ||
               l.studentId?.toString() === this.student!._id?.toString() ||
               l._id?.toString() === this.student!._id?.toString();
      });
      console.log('Student on leave:', isOnLeave, 'for date:', dateStr);
      
      // Backend already filtered by dayOfWeek, no need to filter again
      if (periods.length === 0) {
        console.warn(`No timetable periods found for ${dayName} (day ${dayOfWeek})`);
        this.attendanceRecords = [];
        this.loadingAttendanceRecords = false;
        return;
      }
      
      console.log(`Found ${periods.length} periods for ${dayName}:`, periods);
      
      // Merge timetable with attendance
      this.attendanceRecords = periods.map((period: any) => {
        // Match attendance by time range and className
        const attendance = attendanceData.find((a: any) => {
          // Check if className matches (period subject or course name)
          const classNameMatch = a.className === period.subject || 
                                 a.className === period.courseName ||
                                 a.className?.includes(period.subject);
          
          // Check if time overlaps
          const periodStart = this.parseTime(period.startTime);
          const periodEnd = this.parseTime(period.endTime);
          const attStart = new Date(a.classStartTime);
          const attEnd = new Date(a.classEndTime);
          
          const timeMatch = this.timeRangesOverlap(
            periodStart, periodEnd,
            attStart.getHours() * 60 + attStart.getMinutes(),
            attEnd.getHours() * 60 + attEnd.getMinutes()
          );
          
          return classNameMatch && timeMatch;
        });
        
        // Determine status
        let status = 'Pending';
        let remarks = '';
        
        if (isOnLeave) {
          // Student is on leave for this day
          status = 'Leave';
          remarks = 'Student on approved leave';
        } else if (attendance) {
          // Attendance marked
          status = attendance.status;
          remarks = attendance.reasonForAbsence || '';
        } else if (isToday) {
          // Check if period has started
          const periodStartMinutes = this.parseTime(period.startTime);
          const currentMinutes = this.currentTime.getHours() * 60 + this.currentTime.getMinutes();
          
          if (currentMinutes < periodStartMinutes) {
            status = 'Pending';
            remarks = 'Period not yet started';
          } else {
            status = 'Not Marked';
            remarks = 'Attendance not marked yet';
          }
        } else {
          // Past date, no attendance record
          status = 'Not Marked';
          remarks = 'No attendance record found';
        }
        
        console.log(`Period ${period.periodNumber} (${period.subject}): ${status}`);
        
        return {
          periodNumber: period.periodNumber,
          startTime: period.startTime,
          endTime: period.endTime,
          subject: period.subject,
          faculty: period.faculty,
          hallName: period.hallName || period.hall || 'N/A',
          status: status,
          remarks: remarks
        };
      });
      
      console.log('Final attendance records:', this.attendanceRecords);
      this.loadingAttendanceRecords = false;
    }).catch((error) => {
      console.error('Error loading attendance data:', error);
      this.attendanceRecords = [];
      this.loadingAttendanceRecords = false;
      this.notificationService.showError('Failed to load attendance records');
    });
  }
  
  // Helper function to parse time string (HH:MM) to minutes
  parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  // Helper function to check if time ranges overlap
  timeRangesOverlap(start1: number, end1: number, start2: number, end2: number): boolean {
    return start1 < end2 && start2 < end1;
  }
  
  loadTodayAttendance(): void {
    this.selectedAttendanceDate = new Date();
    this.loadAttendanceRecords();
  }
  
  formatAttendanceDate(date: Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  getAttendanceStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'status-present';
      case 'absent':
        return 'status-absent';
      case 'leave':
        return 'status-leave';
      case 'late':
        return 'status-late';
      case 'pending':
        return 'status-pending';
      case 'not marked':
        return 'status-not-marked';
      default:
        return 'status-not-marked';
    }
  }
  
  getAttendanceSummary(status: string): number {
    return this.attendanceRecords.filter(r => r.status === status).length;
  }

  // ==================== INTERNAL MARKS METHODS ====================
  
  loadInternalMarks(): void {
    if (!this.studentId || !this.selectedAcademicYear) return;
    
  this.loadingInternalMarks = true;
  this.sharedService.getStudentMarksByYear(this.studentId, String(this.selectedAcademicYear)).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.internalMarksData = response.data;
          console.log('Internal marks loaded:', this.internalMarksData);
        } else {
          this.notificationService.showError(response.message || 'Failed to load internal marks');
        }
        this.loadingInternalMarks = false;
      },
      error: (error) => {
        console.error('Error loading internal marks:', error);
        this.notificationService.showError('Failed to load internal marks');
        this.loadingInternalMarks = false;
      }
    });
  }

  saveInternalMarks(element: any): void {
    if (!element.tempMarks && element.tempMarks !== 0) {
      this.notificationService.showError('Please enter marks');
      return;
    }

    if (element.tempMarks < 0 || element.tempMarks > element.subject.maxMarks) {
      this.notificationService.showError(`Marks must be between 0 and ${element.subject.maxMarks}`);
      return;
    }

    const marksData = {
      studentId: this.studentId,
      subjectId: element.subject._id,
      academicYear: String(this.selectedAcademicYear),
      marksObtained: element.tempMarks,
      remarks: element.tempRemarks || ''
    };

    this.sharedService.saveInternalMarks(marksData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificationService.showSuccess('Marks saved successfully');
          this.loadInternalMarks();
        } else {
          this.notificationService.showError(response.message || 'Failed to save marks');
        }
      },
      error: (error) => {
        console.error('Error saving marks:', error);
        this.notificationService.showError(error.error?.message || 'Failed to save marks');
      }
    });
  }

  editInternalMarks(element: any): void {
    element.tempMarks = element.marks.marksObtained;
    element.tempRemarks = element.marks.remarks || '';
    element.isEditing = true;
  }

  cancelEditMarks(element: any): void {
    element.tempMarks = null;
    element.tempRemarks = '';
    element.isEditing = false;
  }

  deleteInternalMarks(element: any): void {
    if (!confirm('Are you sure you want to delete these marks?')) {
      return;
    }

    this.sharedService.deleteInternalMarks(element.marks._id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificationService.showSuccess('Marks deleted successfully');
          this.loadInternalMarks();
        } else {
          this.notificationService.showError(response.message || 'Failed to delete marks');
        }
      },
      error: (error) => {
        console.error('Error deleting marks:', error);
        this.notificationService.showError('Failed to delete marks');
      }
    });
  }

  // ==================== ACHIEVEMENT METHODS ====================
  
  loadAchievements(): void {
    if (!this.studentId) return;
    
    this.loadingAchievements = true;
    this.sharedService.getStudentAchievements(this.studentId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.achievements = response.data || [];
        } else {
          this.notificationService.showError(response.message || 'Failed to load achievements');
        }
        this.loadingAchievements = false;
      },
      error: (error) => {
        console.error('Error loading achievements:', error);
        this.notificationService.showError('Failed to load achievements');
        this.loadingAchievements = false;
      }
    });
  }

  openCreateAchievementDialog(): void {
    const dialogRef = this.dialog.open(AchievementDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createAchievement(result.title, result.description, result.imageUrl || undefined);
      }
    });
  }

  createAchievement(title: string, description: string, imageUrl?: string): void {
    if (!this.studentId) return;
    
    const achievementData = {
      studentId: this.studentId,
      title,
      description,
      imageUrl
    };

    this.sharedService.createAchievement(achievementData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificationService.showSuccess('Achievement created and sent for approval. It will appear here once approved by admin.');
          // Don't reload achievements - let it show only after admin approval
          // this.loadAchievements();
        } else {
          this.notificationService.showError(response.message || 'Failed to create achievement');
        }
      },
      error: (error) => {
        console.error('Error creating achievement:', error);
        this.notificationService.showError(error.error?.message || 'Failed to create achievement');
      }
    });
  }

  deleteAchievement(achievementId: string): void {
    if (!confirm('Are you sure you want to delete this achievement?')) {
      return;
    }

    this.sharedService.deleteAchievement(achievementId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificationService.showSuccess('Achievement deleted successfully');
          this.loadAchievements();
        } else {
          this.notificationService.showError(response.message || 'Failed to delete achievement');
        }
      },
      error: (error) => {
        console.error('Error deleting achievement:', error);
        this.notificationService.showError('Failed to delete achievement');
      }
    });
  }
}
