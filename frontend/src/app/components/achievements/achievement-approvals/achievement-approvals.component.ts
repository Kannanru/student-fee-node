import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-achievement-approvals',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <div class="approvals-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>approval</mat-icon>
            Achievement Approval Requests
          </mat-card-title>
          <mat-card-subtitle>Review and approve student achievements</mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="loading()" class="loading-state">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading pending achievements...</p>
      </div>

      <!-- Pending Achievements Grid -->
      <div *ngIf="!loading() && pendingAchievements().length > 0" class="achievements-grid">
        <mat-card *ngFor="let achievement of pendingAchievements()" class="pending-achievement-card">
          <img mat-card-image 
               [src]="achievement.imageUrl ? 'http://localhost:5000' + achievement.imageUrl : 'assets/default-achievement.svg'" 
               [alt]="achievement.title"
               class="achievement-image"
               (error)="$event.target.src='assets/default-achievement.svg'">
          <mat-card-header>
            <mat-card-title>{{ achievement.title }}</mat-card-title>
            <mat-chip class="status-chip status-pending">
              <mat-icon>pending</mat-icon>
              Pending
            </mat-chip>
          </mat-card-header>
          <mat-card-content>
            <p class="achievement-description">{{ achievement.description }}</p>
            
            <div class="student-info">
              <mat-icon>person</mat-icon>
              <div>
                <strong>{{ achievement.studentId?.firstName }} {{ achievement.studentId?.lastName }}</strong>
                <p>{{ achievement.studentId?.studentId }} • {{ achievement.studentId?.programName }}</p>
              </div>
            </div>

            <div class="submission-info">
              <span class="info-item">
                <mat-icon>calendar_today</mat-icon>
                {{ achievement.createdAt | date:'medium' }}
              </span>
              <span class="info-item">
                <mat-icon>person_outline</mat-icon>
                {{ achievement.createdBy?.name }}
              </span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="approveAchievement(achievement._id)">
              <mat-icon>check</mat-icon>
              Approve
            </button>
            <button mat-raised-button color="warn" (click)="openRejectDialog(achievement._id)">
              <mat-icon>close</mat-icon>
              Reject
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && pendingAchievements().length === 0" class="empty-state">
        <mat-icon>inbox</mat-icon>
        <h3>No Pending Approvals</h3>
        <p>All achievement requests have been processed.</p>
      </div>
    </div>
  `,
  styles: [`
    .approvals-container {
      padding: 24px;
      background-color: #f5f7fa;
      min-height: calc(100vh - 120px);
    }

    .header-card {
      margin-bottom: 32px;
    }

    .header-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1976d2;
      font-size: 24px;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .achievements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .pending-achievement-card {
      border-left: 4px solid #ff9800;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .pending-achievement-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }

    .achievement-image {
      width: 100%;
      height: 220px;
      object-fit: cover;
    }

    .achievement-description {
      color: #666;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .student-info {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .student-info mat-icon {
      color: #1976d2;
    }

    .student-info strong {
      display: block;
      color: #333;
      margin-bottom: 4px;
    }

    .student-info p {
      margin: 0;
      color: #666;
      font-size: 13px;
    }

    .submission-info {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      padding-top: 12px;
      border-top: 1px solid #e0e0e0;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #666;
      font-size: 13px;
    }

    .info-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #999;
    }

    .status-chip {
      font-size: 12px;
      height: 24px;
    }

    .status-pending {
      background-color: #ff9800 !important;
      color: white !important;
    }

    mat-card-actions {
      display: flex;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .achievements-grid {
        grid-template-columns: 1fr;
      }

      mat-card-actions {
        flex-direction: column;
      }

      mat-card-actions button {
        width: 100%;
      }
    }
  `]
})
export class AchievementApprovalsComponent implements OnInit {
  pendingAchievements = signal<any[]>([]);
  loading = signal(false);

  constructor(
    private sharedService: SharedService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPendingAchievements();
  }

  loadPendingAchievements(): void {
    this.loading.set(true);
    this.sharedService.getPendingAchievements().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.pendingAchievements.set(response.data || []);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading pending achievements:', error);
        this.notificationService.showError('Failed to load pending achievements');
        this.loading.set(false);
      }
    });
  }

  approveAchievement(achievementId: string): void {
    if (!confirm('Approve this achievement?')) return;

    this.sharedService.approveAchievement(achievementId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificationService.showSuccess('Achievement approved successfully');
          this.loadPendingAchievements();
        } else {
          this.notificationService.showError(response.message || 'Failed to approve achievement');
        }
      },
      error: (error) => {
        console.error('Error approving achievement:', error);
        this.notificationService.showError('Failed to approve achievement');
      }
    });
  }

  openRejectDialog(achievementId: string): void {
    const reason = prompt('Enter rejection reason (optional):');
    this.rejectAchievement(achievementId, reason || undefined);
  }

  rejectAchievement(achievementId: string, reason?: string): void {
    this.sharedService.rejectAchievement(achievementId, reason).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificationService.showSuccess('Achievement rejected');
          this.loadPendingAchievements();
        } else {
          this.notificationService.showError(response.message || 'Failed to reject achievement');
        }
      },
      error: (error) => {
        console.error('Error rejecting achievement:', error);
        this.notificationService.showError('Failed to reject achievement');
      }
    });
  }
}
