import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedService } from '../../services/shared.service';

interface InternalSubject {
  _id: string;
  subjectCode: string;
  subjectName: string;
  department: string;
  year: number;
  maxMarks: number;
  passingMarks: number;
  credits: number;
  description?: string;
  isActive: boolean;
  createdBy?: any;
  updatedBy?: any;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-subject-master',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './subject-master.component.html',
  styleUrl: './subject-master.component.css'
})
export class SubjectMasterComponent implements OnInit {
  subjects = signal<InternalSubject[]>([]);
  filteredSubjects = computed(() => {
    const subs = this.subjects();
    const deptFilter = this.selectedDepartment();
    const yearFilter = this.selectedYear();

    return subs.filter(s => {
      if (deptFilter && s.department !== deptFilter) return false;
      if (yearFilter && s.year !== yearFilter) return false;
      return true;
    });
  });

  loading = signal(false);
  submitting = signal(false);
  isEditMode = signal(false);
  editingSubjectId = signal<string | null>(null);

  selectedDepartment = signal<string>('');
  selectedYear = signal<number | null>(null);

  departments = ['BDS', 'MBBS', 'BAMS', 'BHMS', 'B.Sc Nursing'];
  years = [1, 2, 3, 4, 5, 6];
  displayedColumns = ['subjectCode', 'subjectName', 'department', 'year', 'maxMarks', 'credits', 'status', 'actions'];

  private fb = inject(FormBuilder);
  private sharedService = inject(SharedService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  subjectForm: FormGroup;

  constructor() {
    this.subjectForm = this.createForm();
  }

  // Return human-friendly year label (1 -> 1st Year, 2 -> 2nd Year, ...)
  yearLabel(y: number): string {
    const suffix = (n: number) => {
      if (n === 1) return 'st';
      if (n === 2) return 'nd';
      if (n === 3) return 'rd';
      return 'th';
    };
    return `${y}${suffix(y)} Year`;
  }

  ngOnInit(): void {
    this.loadSubjects();
  }

  createForm(): FormGroup {
    return this.fb.group({
      subjectCode: ['', [Validators.required, Validators.maxLength(20)]],
      subjectName: ['', [Validators.required, Validators.maxLength(200)]],
      department: ['', Validators.required],
      year: [null, [Validators.required, Validators.min(1), Validators.max(6)]],
      maxMarks: [100, [Validators.required, Validators.min(1), Validators.max(1000)]],
      passingMarks: [40, [Validators.required, Validators.min(0), Validators.max(1000)]],
      credits: [0, [Validators.min(0), Validators.max(10)]],
      description: ['', Validators.maxLength(500)],
      isActive: [true]
    });
  }

  loadSubjects(): void {
    this.loading.set(true);
    this.sharedService.getInternalSubjects().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.subjects.set(response.data || []);
        } else {
          this.snackBar.open(response.message || 'Failed to load subjects', 'Close', { duration: 3000 });
        }
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading subjects:', error);
        this.snackBar.open('Failed to load subjects', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.subjectForm.invalid) {
      this.snackBar.open('Please fill all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    this.submitting.set(true);
    const formData = this.subjectForm.value;

    if (this.isEditMode()) {
      // Update existing subject
      this.sharedService.updateInternalSubject(this.editingSubjectId()!, formData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.snackBar.open('Subject updated successfully', 'Close', { duration: 3000 });
            this.loadSubjects();
            this.resetForm();
          } else {
            this.snackBar.open(response.message || 'Failed to update subject', 'Close', { duration: 3000 });
          }
          this.submitting.set(false);
        },
        error: (error: any) => {
          console.error('Error updating subject:', error);
          this.snackBar.open(error.error?.message || 'Failed to update subject', 'Close', { duration: 3000 });
          this.submitting.set(false);
        }
      });
    } else {
      // Create new subject
      this.sharedService.createInternalSubject(formData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.snackBar.open('Subject created successfully', 'Close', { duration: 3000 });
            this.loadSubjects();
            this.resetForm();
          } else {
            this.snackBar.open(response.message || 'Failed to create subject', 'Close', { duration: 3000 });
          }
          this.submitting.set(false);
        },
        error: (error: any) => {
          console.error('Error creating subject:', error);
          this.snackBar.open(error.error?.message || 'Failed to create subject', 'Close', { duration: 3000 });
          this.submitting.set(false);
        }
      });
    }
  }

  editSubject(subject: InternalSubject): void {
    this.isEditMode.set(true);
    this.editingSubjectId.set(subject._id);
    this.subjectForm.patchValue({
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      department: subject.department,
      year: subject.year,
      maxMarks: subject.maxMarks,
      passingMarks: subject.passingMarks,
      credits: subject.credits,
      description: subject.description,
      isActive: subject.isActive
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteSubject(subject: InternalSubject): void {
    if (!confirm(`Are you sure you want to delete "${subject.subjectName}"? This action cannot be undone if marks entries exist.`)) {
      return;
    }

    this.sharedService.deleteInternalSubject(subject._id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.snackBar.open('Subject deleted successfully', 'Close', { duration: 3000 });
          this.loadSubjects();
        } else {
          this.snackBar.open(response.message || 'Failed to delete subject', 'Close', { duration: 3000 });
        }
      },
      error: (error: any) => {
        console.error('Error deleting subject:', error);
        this.snackBar.open(error.error?.message || 'Failed to delete subject', 'Close', { duration: 3000 });
      }
    });
  }

  toggleStatus(subject: InternalSubject): void {
    const updatedData = { isActive: !subject.isActive };
    this.sharedService.updateInternalSubject(subject._id, updatedData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.snackBar.open(`Subject ${subject.isActive ? 'deactivated' : 'activated'} successfully`, 'Close', { duration: 3000 });
          this.loadSubjects();
        } else {
          this.snackBar.open(response.message || 'Failed to update status', 'Close', { duration: 3000 });
        }
      },
      error: (error: any) => {
        console.error('Error updating status:', error);
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
      }
    });
  }

  resetForm(): void {
    this.subjectForm.reset({
      maxMarks: 100,
      passingMarks: 40,
      credits: 0,
      isActive: true
    });
    this.isEditMode.set(false);
    this.editingSubjectId.set(null);
  }

  clearFilters(): void {
    this.selectedDepartment.set('');
    this.selectedYear.set(null);
    // removed semester filtering
  }
}
