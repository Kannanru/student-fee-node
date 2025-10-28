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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-quota-form',
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
    MatSlideToggleModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './quota-form.component.html',
  styleUrl: './quota-form.component.css'
})
export class QuotaFormComponent implements OnInit {
  quotaForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  quotaId: string | null = null;

  quotaCodes = [
    { value: 'puducherry-ut', label: 'Puducherry UT' },
    { value: 'all-india', label: 'All India' },
    { value: 'nri', label: 'NRI' },
    { value: 'self-sustaining', label: 'Self Sustaining' }
  ];

  currencies = [
    { value: 'INR', label: 'INR (Indian Rupee)' },
    { value: 'USD', label: 'USD (US Dollar)' }
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
        this.quotaId = params['id'];
        this.loadQuota();
      }
    });
  }

  initForm(): void {
    this.quotaForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      displayName: ['', Validators.required],
      description: [''],
      defaultCurrency: ['INR', Validators.required],
      requiresUSDTracking: [false],
      seatAllocation: [0, [Validators.min(0)]],
      eligibilityCriteria: [''],
      priority: [0, Validators.min(0)],
      active: [true],
      metadata: this.fb.group({
        color: ['#1976d2'],
        icon: ['people']
      })
    });

    // Watch code changes to auto-fill name and displayName
    this.quotaForm.get('code')?.valueChanges.subscribe(code => {
      if (!this.isEditMode() && code) {
        const label = this.quotaCodes.find(q => q.value === code)?.label || '';
        this.quotaForm.patchValue({
          name: label,
          displayName: label
        });
        
        // Auto-set currency and USD tracking for NRI
        if (code === 'nri') {
          this.quotaForm.patchValue({
            defaultCurrency: 'USD',
            requiresUSDTracking: true
          });
        } else {
          this.quotaForm.patchValue({
            defaultCurrency: 'INR',
            requiresUSDTracking: false
          });
        }
      }
    });
  }

  loadQuota(): void {
    if (!this.quotaId) return;

    this.loading.set(true);
    this.sharedService.getQuota(this.quotaId).subscribe({
      next: (data) => {
        this.quotaForm.patchValue(data);
        if (this.isEditMode()) {
          this.quotaForm.get('code')?.disable();
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading quota:', error);
        this.snackBar.open('Failed to load quota', 'Close', { duration: 3000 });
        this.loading.set(false);
        this.router.navigate(['/fees/master/quotas']);
      }
    });
  }

  onSubmit(): void {
    if (this.quotaForm.invalid) {
      Object.keys(this.quotaForm.controls).forEach(key => {
        this.quotaForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    const formValue = { ...this.quotaForm.value };
    
    // Re-enable code for submission if in edit mode
    if (this.isEditMode() && this.quotaForm.get('code')?.disabled) {
      formValue.code = this.quotaForm.get('code')?.value;
    }

    const request = this.isEditMode() && this.quotaId
      ? this.sharedService.updateQuota(this.quotaId, formValue)
      : this.sharedService.createQuota(formValue);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          `Quota ${this.isEditMode() ? 'updated' : 'created'} successfully`,
          'Close',
          { duration: 3000 }
        );
        this.router.navigate(['/fees/master/quotas']);
      },
      error: (error) => {
        console.error('Error saving quota:', error);
        this.snackBar.open(
          error.error?.message || 'Failed to save quota',
          'Close',
          { duration: 3000 }
        );
        this.loading.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/fees/master/quotas']);
  }
}
