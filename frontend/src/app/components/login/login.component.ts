// src/app/components/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ApiService } from '../../services/api.service';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  healthStatus: 'online' | 'offline' = 'offline';
  returnUrl = '/dashboard';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    // Check server health status
    this.checkServerHealth();
    
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private checkServerHealth(): void {
    this.apiService.healthCheck().subscribe({
      next: (response) => {
        this.healthStatus = response.status === 'OK' ? 'online' : 'offline';
      },
      error: () => {
        this.healthStatus = 'offline';
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.performLogin();
    } else {
      this.markFormGroupTouched();
    }
  }

  private performLogin(): void {
    this.isLoading = true;
    
    const credentials: LoginRequest = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Login successful! Redirecting...');
          
          // Small delay to show success message before redirect
          setTimeout(() => {
            this.router.navigate([this.returnUrl]);
          }, 1000);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.handleApiError(error);
        
        // Clear password field on error
        this.loginForm.get('password')?.setValue('');
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Utility methods for template
  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.capitalizeFirst(fieldName)} is required`;
    }
    
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    if (field?.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength']?.requiredLength;
      return `${this.capitalizeFirst(fieldName)} must be at least ${requiredLength} characters long`;
    }
    
    return '';
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Handle Enter key press
  onEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSubmit();
    }
  }

  // Test credentials for development (remove in production)
  fillTestCredentials(userType: string = 'admin'): void {
    const credentials = {
      admin: {
        email: 'admin@mgdc.com',
        password: 'admin123'
      },
      student: {
        email: 'student@example.com',
        password: 'Password123'
      }
    };

    const selectedCredentials = credentials[userType as keyof typeof credentials] || credentials.admin;
    
    this.loginForm.patchValue({
      email: selectedCredentials.email,
      password: selectedCredentials.password
    });
    
    // Show notification about which credentials were filled
    this.notificationService.showInfo(`${userType.charAt(0).toUpperCase() + userType.slice(1)} credentials filled. Click login to test.`);
  }
}