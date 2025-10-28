import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedService } from '../../../services/shared.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-achievement-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>emoji_events</mat-icon>
      Create New Achievement
    </h2>
    <mat-dialog-content>
      <form [formGroup]="achievementForm" class="achievement-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" placeholder="e.g., First Place in Science Fair">
          <mat-icon matPrefix>title</mat-icon>
          <mat-error *ngIf="achievementForm.get('title')?.hasError('required')">
            Title is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" 
                    rows="4" 
                    placeholder="Describe the achievement..."></textarea>
          <mat-icon matPrefix>description</mat-icon>
          <mat-error *ngIf="achievementForm.get('description')?.hasError('required')">
            Description is required
          </mat-error>
        </mat-form-field>

        <!-- File Upload Section -->
        <div class="file-upload-section">
          <input type="file" 
                 #fileInput 
                 (change)="onFileSelected($event)" 
                 accept="image/*" 
                 style="display: none;">
          
          <button type="button" 
                  mat-raised-button 
                  color="accent" 
                  (click)="fileInput.click()"
                  [disabled]="uploading">
            <mat-icon>upload</mat-icon>
            {{ selectedFile ? 'Change Image' : 'Upload Image' }}
          </button>

          <div *ngIf="selectedFile" class="file-info">
            <mat-icon>image</mat-icon>
            <span>{{ selectedFile.name }}</span>
            <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
            <button type="button" 
                    mat-icon-button 
                    color="warn" 
                    (click)="removeFile()"
                    [disabled]="uploading">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div *ngIf="uploading" class="upload-progress">
            <mat-spinner diameter="30"></mat-spinner>
            <span>Uploading image...</span>
          </div>
        </div>

        <!-- Image Preview -->
        <div *ngIf="imagePreview" class="image-preview">
          <img [src]="imagePreview" alt="Achievement preview">
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" [disabled]="uploading">
        <mat-icon>close</mat-icon>
        Cancel
      </button>
      <button mat-raised-button color="primary" 
              (click)="onSubmit()" 
              [disabled]="achievementForm.invalid || uploading">
        <mat-icon>check</mat-icon>
        Submit
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1976d2;
      margin: 0;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    mat-dialog-content {
      padding: 24px;
      min-width: 500px;
    }

    .achievement-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .image-preview {
      margin-top: 16px;
      text-align: center;
    }

    .image-preview img {
      max-width: 100%;
      max-height: 300px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .error-text {
      color: #f44336;
      font-size: 12px;
      margin-top: 8px;
    }

    .file-upload-section {
      margin: 16px 0;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .file-info mat-icon {
      color: #1976d2;
    }

    .file-size {
      color: #666;
      font-size: 12px;
    }

    .upload-progress {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
      padding: 12px;
      background: #e3f2fd;
      border-radius: 8px;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      gap: 12px;
    }

    @media (max-width: 600px) {
      mat-dialog-content {
        min-width: auto;
        width: 100%;
      }
    }
  `]
})
export class AchievementDialogComponent {
  achievementForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  uploading = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AchievementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sharedService: SharedService,
    private notificationService: NotificationService
  ) {
    this.achievementForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: ['']
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.notificationService.showError('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.showError('File size must be less than 5MB');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.achievementForm.patchValue({ imageUrl: '' });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  async onSubmit(): Promise<void> {
    if (this.achievementForm.valid) {
      let imageUrl = '';

      // Upload image if selected
      if (this.selectedFile) {
        this.uploading = true;
        try {
          const uploadResult = await this.uploadImage();
          imageUrl = uploadResult.imageUrl;
        } catch (error) {
          this.uploading = false;
          this.notificationService.showError('Failed to upload image');
          return;
        }
        this.uploading = false;
      }

      const result = {
        title: this.achievementForm.value.title,
        description: this.achievementForm.value.description,
        imageUrl: imageUrl,
        selectedFileName: this.selectedFile?.name
      };

      this.dialogRef.close(result);
    }
  }

  private uploadImage(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.selectedFile) {
        resolve({ imageUrl: '' });
        return;
      }

      const formData = new FormData();
      formData.append('image', this.selectedFile);

      this.sharedService.uploadAchievementImage(formData).subscribe({
        next: (response: any) => {
          if (response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response.message));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
}
