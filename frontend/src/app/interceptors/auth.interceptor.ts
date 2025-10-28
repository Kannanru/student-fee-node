// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add auth header if token exists
    const token = this.authService.getToken();
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized - token expired or invalid
        if (error.status === 401) {
          this.notificationService.showError('Session expired. Please login again.');
          this.authService.logout();
          return throwError(() => error);
        }

        // Handle 403 Forbidden - insufficient permissions
        if (error.status === 403) {
          this.notificationService.showError('You do not have permission to perform this action.');
          return throwError(() => error);
        }

        // Handle 404 Not Found
        if (error.status === 404) {
          this.notificationService.showError('The requested resource was not found.');
          return throwError(() => error);
        }

        // Handle 500 Internal Server Error
        if (error.status === 500) {
          this.notificationService.showError('Server error occurred. Please try again later.');
          return throwError(() => error);
        }

        // Handle network errors
        if (error.status === 0) {
          this.notificationService.showError('Network error. Please check your connection.');
          return throwError(() => error);
        }

        return throwError(() => error);
      })
    );
  }
}