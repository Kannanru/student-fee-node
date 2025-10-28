import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-attendance-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="settings-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>settings</mat-icon>
            Attendance Settings
          </mat-card-title>
          <mat-card-subtitle>Configure attendance rules and thresholds</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading settings...</p>
            </div>
          } @else {
            <div class="settings-section">
              <h3>Late Threshold</h3>
              <p class="description">
                Set the maximum minutes a student can be late before being marked as Absent.
              </p>

              <mat-form-field appearance="outline" class="threshold-field">
                <mat-label>Late Threshold (minutes)</mat-label>
                <input 
                  matInput 
                  type="number" 
                  [(ngModel)]="lateThreshold" 
                  min="0" 
                  max="60"
                  placeholder="Enter minutes (0-60)">
                <mat-icon matPrefix>timer</mat-icon>
                <mat-hint>
                  Current: If student is late by {{ lateThreshold }} minutes or more, they will be marked as Absent
                </mat-hint>
              </mat-form-field>

              <div class="example-box">
                <mat-icon>info</mat-icon>
                <div>
                  <strong>Example:</strong>
                  <p>If threshold is set to {{ lateThreshold }} minutes:</p>
                  <ul>
                    <li>Student arrives {{ lateThreshold - 1 }} minutes late → Marked as <span class="status-late">Late</span></li>
                    <li>Student arrives {{ lateThreshold }} minutes or more late → Marked as <span class="status-absent">Absent</span></li>
                  </ul>
                </div>
              </div>
            </div>
          }
        </mat-card-content>

        <mat-card-actions>
          <button 
            mat-raised-button 
            color="primary" 
            (click)="save()"
            [disabled]="saving() || loading()">
            @if (saving()) {
              <mat-spinner diameter="20" style="display: inline-block; margin-right: 8px;"></mat-spinner>
            }
            Save Settings
          </button>
          <button 
            mat-button 
            (click)="reset()"
            [disabled]="saving() || loading()">
            Reset to Default
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    mat-card {
      margin-bottom: 24px;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 24px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 16px;
    }

    .settings-section {
      margin-bottom: 24px;
    }

    .settings-section h3 {
      color: #667eea;
      margin-bottom: 8px;
    }

    .description {
      color: #666;
      margin-bottom: 16px;
    }

    .threshold-field {
      width: 100%;
      max-width: 400px;
    }

    .example-box {
      display: flex;
      gap: 12px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      margin-top: 16px;
    }

    .example-box mat-icon {
      color: #667eea;
      flex-shrink: 0;
    }

    .example-box strong {
      color: #333;
    }

    .example-box p {
      margin: 8px 0;
      color: #666;
    }

    .example-box ul {
      margin: 8px 0;
      padding-left: 20px;
    }

    .example-box li {
      margin: 4px 0;
      color: #666;
    }

    .status-late {
      color: #ff9800;
      font-weight: 600;
    }

    .status-absent {
      color: #f44336;
      font-weight: 600;
    }

    mat-card-actions {
      display: flex;
      gap: 12px;
      padding: 16px;
    }
  `]
})
export class AttendanceSettingsComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api';
  
  loading = signal(false);
  saving = signal(false);
  lateThreshold = 10; // Default value

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);
    this.http.get<any>(`${this.apiUrl}/settings/late-threshold`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.lateThreshold = response.data.value;
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading settings:', error);
        this.snackBar.open('Failed to load settings', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  save(): void {
    // Validate
    if (this.lateThreshold < 0 || this.lateThreshold > 60) {
      this.snackBar.open('Late threshold must be between 0 and 60 minutes', 'Close', { duration: 3000 });
      return;
    }

    this.saving.set(true);
    this.http.put<any>(`${this.apiUrl}/settings/late-threshold`, { value: this.lateThreshold }).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(
            `Late threshold updated to ${this.lateThreshold} minutes`, 
            'Close', 
            { duration: 5000 }
          );
        }
        this.saving.set(false);
      },
      error: (error) => {
        console.error('Error saving settings:', error);
        this.snackBar.open('Failed to save settings', 'Close', { duration: 3000 });
        this.saving.set(false);
      }
    });
  }

  reset(): void {
    this.lateThreshold = 10; // Reset to default
    this.snackBar.open('Reset to default value (10 minutes)', 'Close', { duration: 3000 });
  }
}
