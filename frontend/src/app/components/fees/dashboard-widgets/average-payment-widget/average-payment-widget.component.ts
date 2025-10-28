import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-average-payment-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './average-payment-widget.component.html',
  styleUrl: './average-payment-widget.component.css'
})
export class AveragePaymentWidgetComponent {
  @Input() averageAmount = 0;
  @Input() totalPayments = 0;
  @Input() totalStudents = 0;
  @Input() loading = false;

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  getPaymentsPerStudent(): string {
    if (this.totalStudents === 0) return '0';
    return (this.totalPayments / this.totalStudents).toFixed(1);
  }
}
