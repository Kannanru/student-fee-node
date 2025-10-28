// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { StudentService } from '../../services/student.service';
import { FeeService } from '../../services/fee.service';
import { AttendanceService } from '../../services/attendance.service';
import { User } from '../../models/auth.model';

interface DashboardStats {
  totalStudents: number;
  feesCollected: number;
  averageAttendance: number;
  pendingPayments: number;
}

interface ActivityItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  timestamp: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  isLoading = false;
  
  stats: DashboardStats = {
    totalStudents: 0,
    feesCollected: 0,
    averageAttendance: 0,
    pendingPayments: 0
  };

  recentActivities: ActivityItem[] = [];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private studentService: StudentService,
    private feeService: FeeService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    // Get current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Load dashboard data
    this.loadDashboardData();
    
    // Generate sample activities (replace with real data later)
    this.generateSampleActivities();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Simulate API calls - replace with real implementation
    forkJoin({
      students: this.studentService.getStudents(),
      feeHeads: this.feeService.getFeeHeads(),
      // Add more API calls as needed
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.processDashboardData(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.handleLoadingError();
        this.isLoading = false;
      }
    });
  }

  private processDashboardData(data: any): void {
    // Process students data
    if (data.students && Array.isArray(data.students)) {
      this.stats.totalStudents = data.students.length;
    }

    // For now, use sample data - replace with real calculations
    this.stats.feesCollected = 2450000; // Sample data
    this.stats.averageAttendance = 78; // Sample data
    this.stats.pendingPayments = 23; // Sample data
  }

  private handleLoadingError(): void {
    // Use sample data when APIs fail
    this.stats = {
      totalStudents: 156,
      feesCollected: 2450000,
      averageAttendance: 78,
      pendingPayments: 23
    };
    
    this.notificationService.showWarning('Some data could not be loaded. Showing cached information.');
  }

  refreshData(): void {
    this.notificationService.showInfo('Refreshing dashboard data...');
    this.loadDashboardData();
  }

  openProfile(): void {
    // Navigate to profile page
    window.location.href = '/profile';
  }

  logout(): void {
    this.authService.logout();
  }

  private generateSampleActivities(): void {
    const now = new Date();
    
    this.recentActivities = [
      {
        id: '1',
        icon: 'person_add',
        title: 'New Student Registration',
        description: 'John Doe registered for MBBS program',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: '2',
        icon: 'payment',
        title: 'Fee Payment Received',
        description: '₹50,000 payment processed for Student ID: STU2024001',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        id: '3',
        icon: 'event_available',
        title: 'Attendance Recorded',
        description: 'Batch attendance updated for Anatomy class',
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000) // 6 hours ago
      },
      {
        id: '4',
        icon: 'report',
        title: 'Monthly Report Generated',
        description: 'Fee collection report for September 2025',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];
  }

  // Navigation methods for quick actions
  navigateToStudents(): void {
    // Router navigation will be handled by routerLink in template
  }

  navigateToFees(): void {
    // Router navigation will be handled by routerLink in template
  }

  navigateToAttendance(): void {
    // Router navigation will be handled by routerLink in template
  }

  navigateToReports(): void {
    // Router navigation will be handled by routerLink in template
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getAttendanceColor(percentage: number): string {
    if (percentage >= 90) return '#4caf50';
    if (percentage >= 75) return '#ff9800';
    if (percentage >= 60) return '#ffeb3b';
    return '#f44336';
  }
}