import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from './services/auth.service';
import { ApiService } from './services/api.service';
import { NotificationService } from './services/notification.service';
import { HeaderComponent } from './components/shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,
    MatSnackBarModule,
    HeaderComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'MGDC Admin Frontend';

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Initialize authentication state on app startup
    // The AuthService constructor already handles this
    // Optional: ping backend to surface API/DB connectivity status early
    this.apiService.healthCheck().subscribe({
      next: (res: any) => {
        if (res?.status && res.status !== 'ok') {
          this.notificationService.showWarning('API health degraded: ' + (res?.message || 'Unknown issue'));
        }
      },
      error: () => {
        this.notificationService.showError('Cannot reach backend API. Using mock data or limited functionality.');
      }
    });
  }
}
