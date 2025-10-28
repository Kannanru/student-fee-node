import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DashboardStudentStatus } from '../../../../models/fee-management.model';

@Component({
  selector: 'app-student-status-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './student-status-widget.component.html',
  styleUrl: './student-status-widget.component.css'
})
export class StudentStatusWidgetComponent {
  @Input() data: DashboardStudentStatus | null = null;
  @Input() loading = false;

  getPercentage(value: number): number {
    if (!this.data || this.data.total === 0) return 0;
    return Math.round((value / this.data.total) * 100);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'paid': '#4caf50',
      'partiallyPaid': '#ff9800',
      'pending': '#f44336',
      'overdue': '#d32f2f'
    };
    return colors[status] || '#9e9e9e';
  }

  getProgressWidth(value: number): string {
    return `${this.getPercentage(value)}%`;
  }
}
