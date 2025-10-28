import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

interface UploadResult {
  rowNumber: number;
  success: boolean;
  studentId: string;
  year: number;
  status: string;
  message: string;
  billNumber: string | null;
  receiptNumber: string | null;
}

interface UploadSummary {
  total: number;
  valid: number;
  invalid: number;
  processed: number;
  successful: number;
  failed: number;
  alreadyPaid: number;
  details: UploadResult[];
}

@Component({
  selector: 'app-bulk-fee-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './bulk-fee-upload.component.html',
  styleUrl: './bulk-fee-upload.component.css'
})
export class BulkFeeUploadComponent {
  private apiUrl = 'http://localhost:5000/api';
  
  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  uploadComplete = signal(false);
  summary = signal<UploadSummary | null>(null);
  academicYear = signal('2024-2025');
  
  displayedColumns: string[] = ['rowNumber', 'studentId', 'year', 'status', 'message', 'billNumber', 'receiptNumber'];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.name.match(/\.(xlsx|xls)$/)) {
        this.snackBar.open('Please select a valid Excel file (.xlsx or .xls)', 'Close', {
          duration: 5000
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('File size exceeds 5MB limit', 'Close', {
          duration: 5000
        });
        return;
      }
      
      this.selectedFile.set(file);
      this.uploadComplete.set(false);
      this.summary.set(null);
    }
  }

  uploadFile(): void {
    const file = this.selectedFile();
    if (!file) {
      this.snackBar.open('Please select a file first', 'Close', {
        duration: 3000
      });
      return;
    }

    this.uploading.set(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('academicYear', this.academicYear());

    // AuthInterceptor will automatically add the Authorization header
    this.http.post<any>(`${this.apiUrl}/bulk-upload/fees`, formData)
      .subscribe({
        next: (response) => {
          console.log('Upload response:', response);
          this.uploading.set(false);
          this.uploadComplete.set(true);
          this.summary.set(response.results);
          
          const summary = response.results;
          const message = `Upload complete: ${summary.successful} successful, ${summary.failed} failed`;
          this.snackBar.open(message, 'Close', {
            duration: 5000
          });
        },
        error: (error) => {
          console.error('Upload error:', error);
          this.uploading.set(false);
          this.snackBar.open(
            error.error?.message || 'Upload failed. Please try again.',
            'Close',
            { duration: 5000 }
          );
        }
      });
  }

  downloadTemplate(): void {
    // AuthInterceptor will automatically add the Authorization header
    this.http.get(`${this.apiUrl}/bulk-upload/template`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'fee_upload_template.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Template downloaded successfully', 'Close', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Download error:', error);
        this.snackBar.open('Failed to download template', 'Close', {
          duration: 3000
        });
      }
    });
  }

  resetUpload(): void {
    this.selectedFile.set(null);
    this.uploadComplete.set(false);
    this.summary.set(null);
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getStatusColor(success: boolean): string {
    return success ? '#4CAF50' : '#F44336';
  }

  exportResults(): void {
    const summary = this.summary();
    if (!summary) return;

    // Create CSV content
    const headers = ['Row', 'Student ID', 'Year', 'Status', 'Message', 'Bill Number', 'Receipt Number'];
    const rows = summary.details.map(d => [
      d.rowNumber,
      d.studentId,
      d.year,
      d.status,
      d.message,
      d.billNumber || '-',
      d.receiptNumber || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bulk_upload_results_${new Date().getTime()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open('Results exported successfully', 'Close', {
      duration: 3000
    });
  }
}
