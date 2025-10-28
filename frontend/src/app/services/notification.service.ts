// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationMessage } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationMessage[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private snackBar: MatSnackBar) {}

  // Show success message
  showSuccess(message: string, title: string = 'Success'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });

    this.addNotification({
      type: 'success',
      title,
      message,
      duration: 5000
    });
  }

  // Show error message
  showError(message: string, title: string = 'Error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 8000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });

    this.addNotification({
      type: 'error',
      title,
      message,
      duration: 8000
    });
  }

  // Show warning message
  showWarning(message: string, title: string = 'Warning'): void {
    this.snackBar.open(message, 'Close', {
      duration: 6000,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });

    this.addNotification({
      type: 'warning',
      title,
      message,
      duration: 6000
    });
  }

  // Show info message
  showInfo(message: string, title: string = 'Info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });

    this.addNotification({
      type: 'info',
      title,
      message,
      duration: 4000
    });
  }

  // Add notification to the list
  private addNotification(notification: NotificationMessage): void {
    const currentNotifications = this.notificationsSubject.value;
    const newNotifications = [notification, ...currentNotifications].slice(0, 10); // Keep only last 10
    this.notificationsSubject.next(newNotifications);

    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        this.removeNotification(notification);
      }, notification.duration);
    }
  }

  // Remove notification
  removeNotification(notification: NotificationMessage): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n !== notification);
    this.notificationsSubject.next(filteredNotifications);
  }

  // Clear all notifications
  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
  }

  // Get notifications
  getNotifications(): Observable<NotificationMessage[]> {
    return this.notifications$;
  }

  // Handle API errors
  handleApiError(error: any): void {
    let message = 'An unexpected error occurred';
    
    if (error?.error) {
      message = error.error;
    } else if (error?.message) {
      message = error.message;
    }

    this.showError(message);
  }

  // Handle API success
  handleApiSuccess(message: string = 'Operation completed successfully'): void {
    this.showSuccess(message);
  }
}