import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginComponent {
  step = 1;
  loading = false;
  error = '';
  otpSent = false;
  loginForm;
  otpForm;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]]
    });
  }

  sendOtp() {
    this.error = '';
    if (this.loginForm.invalid) return;
    this.loading = true;
    const email = String(this.loginForm.value.email ?? '');
    this.auth.login(email).subscribe({
      next: () => {
        this.otpSent = true;
        this.step = 2;
        this.loading = false;
      },
      error: err => {
        this.error = err.error?.message || 'Error sending OTP';
        this.loading = false;
      }
    });
  }

  verifyOtp() {
    this.error = '';
    if (this.otpForm.invalid) return;
    this.loading = true;
    const email = String(this.loginForm.value.email ?? '');
    const otp = String(this.otpForm.value.otp ?? '');
    this.auth.verifyOtp(email, otp).subscribe({
      next: res => {
        this.loading = false;
      },
      error: err => {
        this.error = err.error?.message || 'Invalid OTP';
        this.loading = false;
      }
    });
  }
}
