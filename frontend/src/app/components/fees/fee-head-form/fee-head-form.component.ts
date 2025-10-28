import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-fee-head-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './fee-head-form.component.html',
  styleUrl: './fee-head-form.component.css'
})
export class FeeHeadFormComponent implements OnInit {
  feeHeadForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  feeHeadId: string | null = null;

  categories = [
    { value: 'academic', label: 'Academic' },
    { value: 'hostel', label: 'Hostel' },
    { value: 'miscellaneous', label: 'Miscellaneous' }
  ];

  frequencies = [
    { value: 'one-time', label: 'One Time' },
    { value: 'annual', label: 'Annual' },
    { value: 'semester', label: 'Semester' }
  ];

  statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.feeHeadId = params['id'];
        this.loadFeeHead();
      }
    });
  }

  initForm(): void {
    this.feeHeadForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9_]+$/)]],
      category: ['academic', Validators.required],
      frequency: ['semester', Validators.required],
      description: [''],
      defaultAmount: [0, [Validators.required, Validators.min(0)]],
      taxability: [false],
      taxPercentage: [0, [Validators.min(0), Validators.max(100)]],
      isRefundable: [false],
      glCode: [''],
      displayOrder: [0, Validators.min(0)],
      status: ['active', Validators.required]
    });

    // Watch taxability changes
    this.feeHeadForm.get('taxability')?.valueChanges.subscribe(taxable => {
      const taxPercentageControl = this.feeHeadForm.get('taxPercentage');
      if (taxable) {
        taxPercentageControl?.setValidators([Validators.required, Validators.min(0.01), Validators.max(100)]);
      } else {
        taxPercentageControl?.setValidators([Validators.min(0), Validators.max(100)]);
        taxPercentageControl?.setValue(0);
      }
      taxPercentageControl?.updateValueAndValidity();
    });
  }

  loadFeeHead(): void {
    if (!this.feeHeadId) return;

    this.loading.set(true);
    this.sharedService.getFeeHead(this.feeHeadId).subscribe({
      next: (data) => {
        this.feeHeadForm.patchValue(data);
        if (this.isEditMode()) {
          this.feeHeadForm.get('code')?.disable();
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading fee head:', error);
        this.snackBar.open('Failed to load fee head', 'Close', { duration: 3000 });
        this.loading.set(false);
        this.router.navigate(['/fees/master/fee-heads']);
      }
    });
  }

  onSubmit(): void {
    if (this.feeHeadForm.invalid) {
      Object.keys(this.feeHeadForm.controls).forEach(key => {
        this.feeHeadForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    
    // Use getRawValue() to include disabled fields
    const formValue = this.feeHeadForm.getRawValue();

    const request = this.isEditMode() && this.feeHeadId
      ? this.sharedService.updateFeeHead(this.feeHeadId, formValue)
      : this.sharedService.createFeeHead(formValue);

    console.log('Submitting fee head:', { isEditMode: this.isEditMode(), id: this.feeHeadId, data: formValue });
    
    request.subscribe({
      next: (response) => {
        console.log('Fee head saved successfully:', response);
        this.snackBar.open(
          `Fee head ${this.isEditMode() ? 'updated' : 'created'} successfully`,
          'Close',
          { duration: 3000 }
        );
        this.router.navigate(['/fees/master/fee-heads']);
      },
      error: (error) => {
        console.error('Error saving fee head:', error);
        const errorMessage = error.error?.message || error.message || 'Failed to save fee head';
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        this.loading.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/fees/master/fee-heads']);
  }

  generateCode(): void {
    const name = this.feeHeadForm.get('name')?.value || '';
    const code = name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20);
    this.feeHeadForm.patchValue({ code });
  }
}
