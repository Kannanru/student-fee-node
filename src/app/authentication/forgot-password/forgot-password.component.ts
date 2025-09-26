import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient) {}

  onSubmit() {
    const requestData = { email: this.email };

    this.http.post('/api/auth/forgot-password', requestData).subscribe({
      next: () => {
        this.successMessage = 'A password reset link has been sent to your email.';
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Failed to send reset link. Please try again.';
        this.successMessage = '';
      }
    });
  }
}