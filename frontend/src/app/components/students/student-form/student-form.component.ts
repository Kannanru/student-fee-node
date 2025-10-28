import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

import { StudentService } from '../../../services/student.service';
import { NotificationService } from '../../../services/notification.service';
import { Student } from '../../../models/student.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatRadioModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.css'
})
export class StudentFormComponent implements OnInit {
  studentForm: FormGroup;
  parentForm: FormGroup;
  isEditMode = false;
  studentId: string | null = null;
  loading = false;
  saving = false;

  // Form options - BDS Medical College
  programOptions = [
    { value: 'BDS', label: 'BDS (Bachelor of Dental Surgery)' },
    { value: 'MDS', label: 'MDS (Master of Dental Surgery)' },
    { value: 'Diploma', label: 'Diploma in Dental Hygiene' }
  ];
  
  academicYearOptions = [
    '2024-2025',
    '2023-2024',
    '2025-2026',
    '2022-2023'
  ];
  
  semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  sectionOptions = ['A', 'B', 'C', 'D'];
  
  genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];
  
  bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  studentTypeOptions = [
    { value: 'full-time', label: 'Full-Time Student' },
    { value: 'part-time', label: 'Part-Time Student' }
  ];
  
  statusOptions = [
    { value: 'active', label: 'Active Student' },
    { value: 'inactive', label: 'Leave of Absence' },
    { value: 'suspended', label: 'Academic Probation' },
    { value: 'graduated', label: 'Graduated (BDS)' },
    { value: 'internship', label: 'Internship' },
    { value: 'dropped', label: 'Dropped Out' },
    { value: 'transferred', label: 'Transferred' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private studentService: StudentService,
    private notificationService: NotificationService
  ) {
    this.studentForm = this.createStudentForm();
    this.parentForm = this.createParentForm();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.studentId = params['id'];
        this.isEditMode = true;
        this.loadStudent();
      }
    });
  }

  createStudentForm(): FormGroup {
    return this.fb.group({
      // Name split into firstName + lastName
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      
      // Identifiers
      studentId: ['', [Validators.required]],
      enrollmentNumber: ['', [Validators.required]],
      
      // Contact Information
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      aadharNumber: ['', [Validators.pattern(/^\d{12}$/)]],
      
      // Personal Information
      dob: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      bloodGroup: [''],
      permanentAddress: ['', [Validators.required]],
      currentAddress: [''],
      
      // Academic Information
      programName: ['BDS', [Validators.required]],
      academicYear: ['2024-2025', [Validators.required]],
      semester: ['', [Validators.required]],
      section: ['', [Validators.required]],
      rollNumber: ['', [Validators.required]],
      admissionDate: ['', [Validators.required]],
      studentType: ['full-time', [Validators.required]],
      
      // Guardian Information
      guardianName: ['', [Validators.required]],
      guardianContact: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      
      // Emergency Contact
      emergencyContactName: ['', [Validators.required]],
      emergencyContactNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      
      // Login Credentials (required for creation)
      password: [''],
      
      // Status
      status: ['active', [Validators.required]]
    });
  }

  createParentForm(): FormGroup {
    return this.fb.group({
      fatherName: ['', [Validators.required]],
      fatherOccupation: [''],
      fatherPhone: ['', [Validators.pattern(/^\d{10}$/)]],
      motherName: ['', [Validators.required]],
      motherOccupation: [''],
      motherPhone: ['', [Validators.pattern(/^\d{10}$/)]],
      parentEmail: ['', [Validators.email]]
    });
  }

  loadStudent() {
    if (!this.studentId) return;

    this.loading = true;
    console.log('Loading student for edit, ID:', this.studentId);
    this.studentService.getStudentById(this.studentId).subscribe({
      next: (student) => {
        console.log('Student data received for edit:', student);
        this.populateForm(student);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading student:', error);
        this.notificationService.showError('Failed to load student data');
        this.router.navigate(['/students']);
      }
    });
  }

  populateForm(student: any) {
    console.log('Populating form with student data:', student);
    
    // Populate student form with correct field names and type conversions
    this.studentForm.patchValue({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      studentId: student.studentId || '',
      enrollmentNumber: student.enrollmentNumber || '',
      email: student.email || '',
      contactNumber: student.contactNumber || '',
      aadharNumber: student.aadharNumber || '',
      dob: student.dob ? new Date(student.dob) : null,
      gender: student.gender || '',
      bloodGroup: student.bloodGroup || '',
      permanentAddress: student.permanentAddress || '',
      currentAddress: student.currentAddress || '',
      programName: student.programName || 'BDS',
      academicYear: student.academicYear || '2024-2025',
      semester: student.semester ? Number(student.semester) : '', // Convert to number, empty string if null
      section: student.section || '',
      rollNumber: student.rollNumber || '',
      admissionDate: student.admissionDate ? new Date(student.admissionDate) : null,
      studentType: student.studentType || 'full-time',
      guardianName: student.guardianName || '',
      guardianContact: student.guardianContact || '',
      emergencyContactName: student.emergencyContactName || '',
      emergencyContactNumber: student.emergencyContactNumber || '',
      status: student.status || 'active'
    });
    
    console.log('Form values after patchValue:', this.studentForm.value);
    console.log('Form validity:', this.studentForm.valid);
    console.log('Form errors:', this.getFormValidationErrors());

    // Populate parent form if data exists (legacy support)
    if (student.parentInfo) {
      this.parentForm.patchValue({
        fatherName: student.parentInfo.fatherName,
        fatherOccupation: student.parentInfo.fatherOccupation,
        fatherPhone: student.parentInfo.fatherPhone,
        motherName: student.parentInfo.motherName,
        motherOccupation: student.parentInfo.motherOccupation,
        motherPhone: student.parentInfo.motherPhone,
        parentEmail: student.parentInfo.parentEmail
      });
    }
  }

  onSubmit() {
    // Add password validation for create mode only
    if (!this.isEditMode) {
      if (!this.studentForm.get('password')?.value) {
        this.studentForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.studentForm.get('password')?.updateValueAndValidity();
      }
    } else {
      // In edit mode, clear password validators (password is optional for updates)
      this.studentForm.get('password')?.clearValidators();
      this.studentForm.get('password')?.updateValueAndValidity();
    }

    if (this.studentForm.invalid) {
      console.log('Form is invalid. Errors:', this.getFormValidationErrors());
      this.markFormGroupTouched(this.studentForm);
      this.notificationService.showError('Please fill in all required fields correctly');
      return;
    }

    this.saving = true;
    
    const studentData: any = {
      ...this.studentForm.value
    };
    
    console.log('📤 Sending student data to API:');
    console.log('Section:', studentData.section);
    console.log('Roll Number:', studentData.rollNumber);
    console.log('Full student data:', studentData);

    // Remove password if editing and it's empty
    if (this.isEditMode && !studentData.password) {
      delete studentData.password;
    }

    const operation = this.isEditMode 
      ? this.studentService.updateStudent(this.studentId!, studentData)
      : this.studentService.createStudent(studentData);

    operation.subscribe({
      next: (response) => {
        const message = this.isEditMode ? 'Student updated successfully' : 'Student created successfully';
        this.notificationService.showSuccess(message);
        this.router.navigate(['/students']);
      },
      error: (error) => {
        console.error('Error saving student:', error);
        this.saving = false;
        
        // Handle validation errors from backend
        if (error.error?.errors && Array.isArray(error.error.errors)) {
          const errorMessages = error.error.errors.map((err: any) => 
            `${err.field}: ${err.message}`
          ).join('; ');
          this.notificationService.showError(`Validation Error: ${errorMessages}`);
        } else if (error.error?.fields) {
          this.notificationService.showError(`Missing required fields: ${error.error.fields.join(', ')}`);
        } else if (error.error?.message) {
          this.notificationService.showError(error.error.message);
        } else if (error.message) {
          this.notificationService.showError(error.message);
        } else {
          const message = this.isEditMode ? 'Failed to update student' : 'Failed to create student';
          this.notificationService.showError(message);
        }
      }
    });
  }

  onCancel() {
    this.router.navigate(['/students']);
  }

  generateStudentId() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const studentId = `STU${year}${randomNum}`;
    this.studentForm.patchValue({ studentId });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string, form: FormGroup = this.studentForm): string {
    const control = form.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('pattern')) {
      if (fieldName.includes('Phone') || fieldName === 'phoneNumber' || fieldName === 'emergencyContact') {
        return 'Please enter a valid 10-digit phone number';
      }
    }
    if (control?.hasError('minlength')) {
      return `${this.getFieldLabel(fieldName)} must be at least ${control.errors?.['minlength']?.requiredLength} characters`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      studentId: 'Student ID',
      enrollmentNumber: 'Enrollment Number',
      email: 'Email',
      contactNumber: 'Contact Number',
      dob: 'Date of Birth',
      gender: 'Gender',
      permanentAddress: 'Permanent Address',
      programName: 'Program Name',
      academicYear: 'Academic Year',
      semester: 'Semester',
      section: 'Section',
      rollNumber: 'Roll Number',
      admissionDate: 'Admission Date',
      studentType: 'Student Type',
      guardianName: 'Guardian Name',
      guardianContact: 'Guardian Contact',
      emergencyContactName: 'Emergency Contact Name',
      emergencyContactNumber: 'Emergency Contact Number',
      password: 'Password',
      status: 'Status',
      bloodGroup: 'Blood Group',
      fatherName: 'Father\'s Name',
      motherName: 'Mother\'s Name',
      fatherPhone: 'Father\'s Phone',
      motherPhone: 'Mother\'s Phone',
      parentEmail: 'Parent Email'
    };
    return labels[fieldName] || fieldName;
  }

  getInvalidFields(): string[] {
    const invalidFields: string[] = [];
    Object.keys(this.studentForm.controls).forEach(key => {
      const control = this.studentForm.get(key);
      if (control?.invalid && control?.enabled) {
        invalidFields.push(this.getFieldLabel(key));
      }
    });
    return invalidFields;
  }

  getRequiredFieldsCount(): { total: number, filled: number } {
    let total = 0;
    let filled = 0;
    Object.keys(this.studentForm.controls).forEach(key => {
      const control = this.studentForm.get(key);
      if (control?.hasValidator(Validators.required)) {
        total++;
        if (control?.valid) {
          filled++;
        }
      }
    });
    return { total, filled };
  }

  isBasicInfoValid(): boolean {
    const basicFields = ['firstName', 'lastName', 'studentId', 'enrollmentNumber', 'email', 'contactNumber', 'dob', 'gender', 'permanentAddress'];
    return basicFields.every(field => this.studentForm.get(field)?.valid);
  }

  isAcademicInfoValid(): boolean {
    const academicFields = ['programName', 'academicYear', 'semester', 'section', 'rollNumber', 'studentType', 'status', 'admissionDate'];
    return academicFields.every(field => this.studentForm.get(field)?.valid);
  }

  isGuardianInfoValid(): boolean {
    const guardianFields = ['guardianName', 'guardianContact', 'emergencyContactName', 'emergencyContactNumber'];
    return guardianFields.every(field => this.studentForm.get(field)?.valid);
  }

  getFormValidationErrors(): any {
    const errors: any = {};
    Object.keys(this.studentForm.controls).forEach(key => {
      const control = this.studentForm.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  showValidationSummary(): void {
    this.markFormGroupTouched(this.studentForm);
    const invalidFields = this.getInvalidFields();
    if (invalidFields.length > 0) {
      const message = `Please fill the following required fields: ${invalidFields.join(', ')}`;
      this.notificationService.showError(message);
    }
  }
}