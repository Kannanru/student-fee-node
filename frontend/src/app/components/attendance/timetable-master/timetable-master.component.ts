import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { AttendanceEnhancedService } from '../../../services/attendance-enhanced.service';
import { EnhancedTimetable, Hall } from '../../../models/attendance-enhanced.model';

@Component({
  selector: 'app-timetable-master',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDividerModule
  ],
  templateUrl: './timetable-master.component.html',
  styleUrl: './timetable-master.component.css'
})
export class TimetableMasterComponent implements OnInit {
  timetables: EnhancedTimetable[] = [];
  halls: Hall[] = [];
  displayedColumns: string[] = ['dayOfWeek', 'periodNumber', 'subject', 'hall', 'startTime', 'endTime', 'faculty', 'actions'];
  loading = false;
  showForm = false;
  timetableForm: FormGroup;
  editMode = false;
  editingId: string | null = null;

  // Filter form
  filterForm: FormGroup;

  programs = ['BDS', 'MBBS', 'MD', 'MS'];
  departments = ['Dentistry', 'Medicine', 'Surgery'];
  years = [1, 2, 3, 4, 5];
  semesters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  periods = [1, 2, 3, 4, 5, 6, 7, 8];
  daysOfWeek = [
    { value: 0, name: 'Sunday' },
    { value: 1, name: 'Monday' },
    { value: 2, name: 'Tuesday' },
    { value: 3, name: 'Wednesday' },
    { value: 4, name: 'Thursday' },
    { value: 5, name: 'Friday' },
    { value: 6, name: 'Saturday' }
  ];

  constructor(
    private attendanceService: AttendanceEnhancedService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      programName: ['BDS'],
      year: [1],
      semester: [1],
      academicYear: ['2025-2026']
    });

    this.timetableForm = this.fb.group({
      className: [''], // Auto-generated
      subject: ['', Validators.required],
      programName: ['BDS', Validators.required],
      department: [''],
      year: [1, Validators.required],
      semester: [1, Validators.required],
      periodNumber: [1, Validators.required],
      academicYear: ['2025-2026', Validators.required],
      dayOfWeek: [1, Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['10:00', Validators.required],
      hallId: ['', Validators.required],
      facultyName: [''],
      room: [''],
      isActive: [true],
      notes: ['']
    });

    // Auto-generate className when program/year changes
    this.timetableForm.get('programName')?.valueChanges.subscribe(() => this.updateClassName());
    this.timetableForm.get('year')?.valueChanges.subscribe(() => this.updateClassName());
  }

  ngOnInit(): void {
    this.loadHalls();
    this.loadTimetables();
  }

  loadHalls(): void {
    this.attendanceService.getAllHalls({ isActive: true }).subscribe({
      next: (response: any) => {
        this.halls = response.data;
      },
      error: (error: any) => {
        console.error('Error loading halls:', error);
      }
    });
  }

  loadTimetables(): void {
    this.loading = true;
    const filters = this.filterForm.value;
    
    this.attendanceService.getAllTimetables(filters).subscribe({
      next: (response: any) => {
        this.timetables = response.data;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading timetables:', error);
        this.snackBar.open('Failed to load timetables', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.loadTimetables();
  }

  openForm(): void {
    this.showForm = true;
    this.editMode = false;
    const filters = this.filterForm.value;
    this.timetableForm.patchValue({
      programName: filters.programName,
      year: filters.year,
      semester: filters.semester,
      academicYear: filters.academicYear,
      isActive: true
    });
    this.updateClassName();
  }

  updateClassName(): void {
    const program = this.timetableForm.get('programName')?.value;
    const year = this.timetableForm.get('year')?.value;
    
    if (program && year) {
      const className = `${program}-${year}`;
      this.timetableForm.patchValue({ className }, { emitEvent: false });
    }
  }

  editTimetable(timetable: EnhancedTimetable): void {
    this.showForm = true;
    this.editMode = true;
    this.editingId = timetable._id!;
    this.timetableForm.patchValue(timetable);
  }

  cancelForm(): void {
    this.showForm = false;
    this.editMode = false;
    this.editingId = null;
    this.timetableForm.reset();
  }

  saveTimetable(): void {
    if (this.timetableForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.updateClassName(); // Ensure className is set
    const data = this.timetableForm.value;

    if (this.editMode && this.editingId) {
      this.attendanceService.updateTimetable(this.editingId, data).subscribe({
        next: () => {
          this.snackBar.open('Timetable updated successfully', 'Close', { duration: 3000 });
          this.loadTimetables();
          this.cancelForm();
        },
        error: (error: any) => {
          console.error('Error updating timetable:', error);
          this.snackBar.open('Failed to update timetable', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.attendanceService.createTimetable(data).subscribe({
        next: () => {
          this.snackBar.open('Timetable created successfully', 'Close', { duration: 3000 });
          this.loadTimetables();
          this.cancelForm();
        },
        error: (error: any) => {
          console.error('Error creating timetable:', error);
          this.snackBar.open('Failed to create timetable', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteTimetable(timetable: EnhancedTimetable): void {
    if (!confirm('Are you sure you want to delete this timetable entry?')) {
      return;
    }

    this.attendanceService.deleteTimetable(timetable._id!).subscribe({
      next: () => {
        this.snackBar.open('Timetable deleted successfully', 'Close', { duration: 3000 });
        this.loadTimetables();
      },
      error: (error: any) => {
        console.error('Error deleting timetable:', error);
        this.snackBar.open('Failed to delete timetable', 'Close', { duration: 3000 });
      }
    });
  }

  getDayName(dayOfWeek: number): string {
    const day = this.daysOfWeek.find(d => d.value === dayOfWeek);
    return day ? day.name : 'Unknown';
  }

  getHallName(hallId: string): string {
    const hall = this.halls.find(h => h._id === hallId);
    return hall ? hall.hallName : 'N/A';
  }

  generateSessions(): void {
    const filters = this.filterForm.value;
    const today = new Date().toISOString().split('T')[0];

    if (!confirm(`Generate class sessions for today (${today}) based on current timetable?`)) {
      return;
    }

    this.attendanceService.generateSessionsFromTimetable({
      date: today,
      program: filters.programName,
      year: filters.year,
      semester: filters.semester
    }).subscribe({
      next: (response: any) => {
        this.snackBar.open(`Generated ${response.data.length} sessions successfully`, 'Close', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Error generating sessions:', error);
        this.snackBar.open('Failed to generate sessions', 'Close', { duration: 3000 });
      }
    });
  }
}
