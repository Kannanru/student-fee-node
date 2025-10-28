import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';

import { EmployeeService } from '../../../services/employee.service';
import { NotificationService } from '../../../services/notification.service';
import { Employee } from '../../../models/employee.model';
import { CustomValidators } from '../../../validators/custom-validators';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatStepperModule
  ],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm!: FormGroup;
  isEditMode = false;
  employeeId: string | null = null;
  loading = false;
  submitting = false;

  // Dropdown options
  departments = [
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Administration',
    'Library',
    'Accounts',
    'Human Resources'
  ];

  designations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lecturer',
    'Lab Assistant',
    'Librarian',
    'Accountant',
    'Administrative Officer',
    'HOD',
    'Principal',
    'Clerk',
    'Peon'
  ];

  categories = [
    { value: 'faculty', label: 'Faculty' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'technical', label: 'Technical' },
    { value: 'support', label: 'Support Staff' }
  ];

  genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'on-leave', label: 'On Leave' },
    { value: 'terminated', label: 'Terminated' }
  ];

  validationErrors: { [key: string]: string } = {};
  Object = Object; // Expose Object to template

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initializeForm();
    
    // Check if edit mode
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId) {
      this.isEditMode = true;
      this.loadEmployee();
    }
  }

  initializeForm() {
    this.employeeForm = this.fb.group({
      // Basic Information
      employeeId: ['', [
        Validators.required, 
        CustomValidators.employeeIdFormat(),
        CustomValidators.noWhitespaceOnly()
      ]],
      firstName: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50),
        CustomValidators.nameFormat(),
        CustomValidators.noWhitespaceOnly()
      ]],
      lastName: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50),
        CustomValidators.nameFormat(),
        CustomValidators.noWhitespaceOnly()
      ]],
      email: ['', [
        Validators.required, 
        Validators.email
        // Optional: Uncomment to enforce institutional email
        // CustomValidators.professionalEmail()
      ]],
      phone: ['', [
        Validators.required, 
        CustomValidators.indianPhoneNumber()
      ]],
      dateOfBirth: ['', [
        Validators.required,
        CustomValidators.notFutureDate(),
        CustomValidators.minimumAge(18)
      ]],
      gender: ['', Validators.required],
      bloodGroup: [''],

      // Professional Information
      joiningDate: ['', [
        Validators.required,
        CustomValidators.joiningDateAfterBirthDate('dateOfBirth')
      ]],
      department: ['', [
        Validators.required,
        CustomValidators.noWhitespaceOnly()
      ]],
      designation: ['', [
        Validators.required,
        CustomValidators.noWhitespaceOnly()
      ]],
      category: ['', Validators.required],
      qualification: ['', [
        Validators.required,
        Validators.minLength(2),
        CustomValidators.noWhitespaceOnly()
      ]],
      experience: [0, [
        Validators.required, 
        CustomValidators.nonNegative(),
        CustomValidators.maximumExperience(50)
      ]],
      status: ['active', Validators.required],

      // Address Information
      street: [''],
      city: [''],
      state: [''],
      pincode: ['', CustomValidators.indianPincode()],
      country: ['India'],

      // Emergency Contact
      emergencyContactName: ['', CustomValidators.nameFormat()],
      emergencyContactRelation: [''],
      emergencyContactPhone: ['', CustomValidators.indianPhoneNumber()]
    }, {
      validators: CustomValidators.joiningDateValidator()
    });
  }

  loadEmployee() {
    if (!this.employeeId) return;

    this.loading = true;
    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (employee) => {
        console.log('Loading employee data:', employee);
        this.populateForm(employee);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employee:', error);
        this.notificationService.showError('Failed to load employee data');
        this.loading = false;
        this.router.navigate(['/employees']);
      }
    });
  }

  populateForm(employee: Employee) {
    this.employeeForm.patchValue({
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      dateOfBirth: employee.dateOfBirth,
      gender: employee.gender,
      bloodGroup: employee.bloodGroup,
      joiningDate: employee.joiningDate,
      department: employee.department,
      designation: employee.designation,
      category: employee.category,
      qualification: employee.qualification,
      experience: employee.experience,
      status: employee.status,
      street: employee.address?.street || '',
      city: employee.address?.city || '',
      state: employee.address?.state || '',
      pincode: employee.address?.pincode || '',
      country: employee.address?.country || 'India',
      emergencyContactName: employee.emergencyContact?.name || '',
      emergencyContactRelation: employee.emergencyContact?.relation || '',
      emergencyContactPhone: employee.emergencyContact?.phone || ''
    });
  }

  onSubmit() {
    if (this.employeeForm.invalid) {
      this.validateAllFormFields();
      this.notificationService.showError('Please fill all required fields correctly');
      return;
    }

    const formValue = this.employeeForm.getRawValue();
    
    const employeeData: Partial<Employee> = {
      employeeId: formValue.employeeId,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      dateOfBirth: formValue.dateOfBirth,
      gender: formValue.gender,
      bloodGroup: formValue.bloodGroup,
      joiningDate: formValue.joiningDate,
      department: formValue.department,
      designation: formValue.designation,
      category: formValue.category,
      qualification: formValue.qualification,
      experience: Number(formValue.experience),
      status: formValue.status,
      address: {
        street: formValue.street,
        city: formValue.city,
        state: formValue.state,
        pincode: formValue.pincode,
        country: formValue.country
      },
      emergencyContact: {
        name: formValue.emergencyContactName,
        relation: formValue.emergencyContactRelation,
        phone: formValue.emergencyContactPhone
      }
    };

    console.log('📤 Submitting employee data:', employeeData);

    this.submitting = true;

    const request = this.isEditMode
      ? this.employeeService.updateEmployee(this.employeeId!, employeeData)
      : this.employeeService.createEmployee(employeeData);

    request.subscribe({
      next: (response) => {
        console.log('✅ Employee saved successfully:', response);
        const message = this.isEditMode 
          ? 'Employee updated successfully' 
          : 'Employee created successfully';
        this.notificationService.showSuccess(message);
        this.router.navigate(['/employees']);
      },
      error: (error) => {
        console.error('❌ Error saving employee:', error);
        const message = error?.error?.message || 'Failed to save employee';
        this.notificationService.showError(message);
        this.submitting = false;
      }
    });
  }

  validateAllFormFields() {
    this.validationErrors = {};
    Object.keys(this.employeeForm.controls).forEach(key => {
      const control = this.employeeForm.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
        if (control.errors) {
          this.validationErrors[key] = this.getErrorMessage(key, control.errors);
        }
      }
    });
  }

  getErrorMessage(fieldName: string, errors: any): string {
    if (errors.required) return `${fieldName} is required`;
    if (errors.email) return 'Invalid email format';
    if (errors.pattern) return `Invalid ${fieldName} format`;
    if (errors.minlength) return `${fieldName} is too short (min ${errors.minlength.requiredLength} characters)`;
    if (errors.maxlength) return `${fieldName} is too long (max ${errors.maxlength.requiredLength} characters)`;
    if (errors.min) return `${fieldName} must be at least ${errors.min.min}`;
    if (errors.max) return `${fieldName} cannot exceed ${errors.max.max}`;
    
    // Custom validator errors
    if (errors.invalidFormat) return errors.invalidFormat.expected;
    if (errors.futureDate) return 'Date cannot be in the future';
    if (errors.minimumAge) return `Minimum age required: ${errors.minimumAge.required} years`;
    if (errors.joiningBeforeBirth) return 'Joining date must be after date of birth';
    if (errors.invalidPhone) return errors.invalidPhone.message;
    if (errors.invalidPincode) return errors.invalidPincode.message;
    if (errors.invalidDomain) return `Allowed domains: ${errors.invalidDomain.allowedDomains}`;
    if (errors.personalEmail) return errors.personalEmail.message;
    if (errors.negative) return `${fieldName} cannot be negative`;
    if (errors.excessiveExperience) return `Experience cannot exceed ${errors.excessiveExperience.max} years`;
    if (errors.invalidName) return errors.invalidName.message;
    if (errors.whitespaceOnly) return `${fieldName} cannot be empty or whitespace only`;
    if (errors.ageAtJoining) return `Employee must be at least ${errors.ageAtJoining.minimum} years old at joining`;
    
    return 'Invalid value';
  }

  hasError(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  cancel() {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      this.router.navigate(['/employees']);
    }
  }
}
