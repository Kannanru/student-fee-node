import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AttendanceEnhancedService } from '../../../services/attendance-enhanced.service';
import { Hall } from '../../../models/attendance-enhanced.model';

@Component({
  selector: 'app-hall-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './hall-management.component.html',
  styleUrl: './hall-management.component.css'
})
export class HallManagementComponent implements OnInit {
  halls: Hall[] = [];
  displayedColumns: string[] = ['hallId', 'hallName', 'type', 'capacity', 'cameraStatus', 'recognitionAccuracy', 'actions'];
  loading = false;
  showForm = false;
  hallForm: FormGroup;
  editMode = false;
  editingHallId: string | null = null;

  hallTypes = ['Lecture', 'Seminar', 'Lab', 'Auditorium'];
  cameraStatuses = ['Online', 'Offline', 'Maintenance', 'Error'];

  constructor(
    private attendanceService: AttendanceEnhancedService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.hallForm = this.fb.group({
      hallId: ['', [Validators.required, Validators.maxLength(50)]],
      hallName: ['', [Validators.required, Validators.maxLength(100)]],
      type: ['Lecture', Validators.required],
      capacity: [50, [Validators.required, Validators.min(1), Validators.max(500)]],
      cameraId: ['', [Validators.required, Validators.maxLength(100)]],
      deviceId: [''],
      location: [''],
      building: [''],
      floor: [''],
      cameraStatus: ['Offline', Validators.required],
      isActive: [true],
      notes: [''],
      configuration: this.fb.group({
        minConfidence: [0.85, [Validators.min(0), Validators.max(1)]],
        maxSpoofScore: [0.1, [Validators.min(0), Validators.max(1)]],
        bufferHours: [2, [Validators.min(0), Validators.max(24)]]
      })
    });
  }

  ngOnInit(): void {
    this.loadHalls();
  }

  loadHalls(): void {
    this.loading = true;
    this.attendanceService.getAllHalls().subscribe({
      next: (response: any) => {
        this.halls = response.data;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading halls:', error);
        this.snackBar.open('Failed to load halls', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  openForm(): void {
    this.showForm = true;
    this.editMode = false;
    this.hallForm.reset({
      type: 'Lecture',
      capacity: 50,
      cameraStatus: 'Offline',
      isActive: true,
      configuration: {
        minConfidence: 0.85,
        maxSpoofScore: 0.1,
        bufferHours: 2
      }
    });
  }

  editHall(hall: Hall): void {
    this.showForm = true;
    this.editMode = true;
    this.editingHallId = hall._id!;
    this.hallForm.patchValue(hall);
  }

  cancelForm(): void {
    this.showForm = false;
    this.editMode = false;
    this.editingHallId = null;
    this.hallForm.reset();
  }

  saveHall(): void {
    if (this.hallForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    const hallData = this.hallForm.value;

    if (this.editMode && this.editingHallId) {
      this.attendanceService.updateHall(this.editingHallId, hallData).subscribe({
        next: (response: any) => {
          this.snackBar.open('Hall updated successfully', 'Close', { duration: 3000 });
          this.loadHalls();
          this.cancelForm();
        },
        error: (error: any) => {
          console.error('Error updating hall:', error);
          this.snackBar.open(error.error?.message || 'Failed to update hall', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.attendanceService.createHall(hallData).subscribe({
        next: (response: any) => {
          this.snackBar.open('Hall created successfully', 'Close', { duration: 3000 });
          this.loadHalls();
          this.cancelForm();
        },
        error: (error: any) => {
          console.error('Error creating hall:', error);
          this.snackBar.open(error.error?.message || 'Failed to create hall', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteHall(hall: Hall): void {
    if (!confirm(`Are you sure you want to delete ${hall.hallName}?`)) {
      return;
    }

    this.attendanceService.deleteHall(hall._id!).subscribe({
      next: () => {
        this.snackBar.open('Hall deleted successfully', 'Close', { duration: 3000 });
        this.loadHalls();
      },
      error: (error: any) => {
        console.error('Error deleting hall:', error);
        this.snackBar.open('Failed to delete hall', 'Close', { duration: 3000 });
      }
    });
  }

  updateCameraStatus(hall: Hall, newStatus: string): void {
    this.attendanceService.updateCameraStatus(hall._id!, newStatus).subscribe({
      next: () => {
        this.snackBar.open('Camera status updated', 'Close', { duration: 2000 });
        this.loadHalls();
      },
      error: (error: any) => {
        console.error('Error updating camera status:', error);
        this.snackBar.open('Failed to update camera status', 'Close', { duration: 3000 });
      }
    });
  }

  getCameraStatusColor(status: string): string {
    switch (status) {
      case 'Online': return 'green';
      case 'Offline': return 'gray';
      case 'Maintenance': return 'orange';
      case 'Error': return 'red';
      default: return 'gray';
    }
  }
}
