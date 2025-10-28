// src/app/components/profile/profile.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { User, UpdateProfileRequest } from '../../models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  profileForm!: FormGroup;
  editMode = false;
  isUpdating = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.profileForm = this.formBuilder.group({
      photo: [''],
      phone: ['', [Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      emergencyContact: ['', [Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      medicalInfo: [''],
      aadharNumber: ['', [Validators.pattern(/^\d{12}$/)]],
      permanentAddress: [''],
      currentAddress: [''],
      address: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        pincode: ['', [Validators.pattern(/^\d{6}$/)]],
        country: ['']
      })
    });
  }

  private loadUserProfile(): void {
    // Get current user from auth service
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.populateForm(user);
        }
      });

    // Refresh profile data from server
    this.refreshProfile();
  }

  private refreshProfile(): void {
    this.authService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.currentUser = response.user;
            this.populateForm(response.user);
          }
        },
        error: (error) => {
          this.notificationService.handleApiError(error);
        }
      });
  }

  private populateForm(user: User): void {
    this.profileForm.patchValue({
      photo: user.photo || '',
      phone: user.phone || '',
      emergencyContact: user.emergencyContact || '',
      medicalInfo: user.medicalInfo || '',
      aadharNumber: (user as any).aadharNumber || '',
      permanentAddress: (user as any).permanentAddress || '',
      currentAddress: (user as any).currentAddress || '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || '',
        country: user.address?.country || ''
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid && !this.isUpdating) {
      this.isUpdating = true;

      const updateData: UpdateProfileRequest = {
        photo: this.profileForm.get('photo')?.value || undefined,
        phone: this.profileForm.get('phone')?.value || undefined,
        emergencyContact: this.profileForm.get('emergencyContact')?.value || undefined,
        medicalInfo: this.profileForm.get('medicalInfo')?.value || undefined,
        address: this.profileForm.get('address')?.value
      };

      // Remove empty values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateProfileRequest] === '' || 
            updateData[key as keyof UpdateProfileRequest] === null) {
          delete updateData[key as keyof UpdateProfileRequest];
        }
      });

      this.authService.updateProfile(updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.showSuccess('Profile updated successfully!');
              this.currentUser = response.user;
              this.editMode = false;
            }
            this.isUpdating = false;
          },
          error: (error) => {
            this.notificationService.handleApiError(error);
            this.isUpdating = false;
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    if (this.currentUser) {
      this.populateForm(this.currentUser);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  onImageError(event: any): void {
    // Set default image if profile image fails to load
    event.target.src = 'assets/images/default-avatar.png';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();

      if (control && control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          control.get(nestedKey)?.markAsTouched();
        });
      }
    });
  }

  // Utility methods for template
  getErrorMessage(fieldName: string, nested?: string): string {
    const field = nested 
      ? this.profileForm.get(nested)?.get(fieldName)
      : this.profileForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.capitalizeFirst(fieldName)} is required`;
    }
    
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    if (field?.hasError('pattern')) {
      if (fieldName.includes('phone') || fieldName.includes('contact')) {
        return 'Please enter a valid phone number';
      }
      if (fieldName === 'pincode') {
        return 'Please enter a valid 6-digit PIN code';
      }
      return 'Please enter a valid format';
    }
    
    return '';
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Check if user has specific permissions
  canEditProfile(): boolean {
    return this.currentUser?.role === 'admin' || this.currentUser?.role === 'student';
  }
}