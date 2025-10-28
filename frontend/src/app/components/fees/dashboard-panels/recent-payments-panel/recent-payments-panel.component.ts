import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DashboardRecentPayment } from '../../../../models/fee-management.model';

@Component({
  selector: 'app-recent-payments-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './recent-payments-panel.component.html',
  styleUrl: './recent-payments-panel.component.css'
})
export class RecentPaymentsPanelComponent {
  @Input() payments: DashboardRecentPayment[] = [];
  @Input() loading = false;
  @Output() viewDetails = new EventEmitter<DashboardRecentPayment>();
  @Output() downloadReceipt = new EventEmitter<DashboardRecentPayment>();

  displayedColumns: string[] = ['student', 'amount', 'mode', 'date', 'actions'];

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  formatUSD(amount: number): string {
    return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getPaymentModeIcon(mode: string): string {
    const icons: { [key: string]: string } = {
      'cash': 'payments',
      'upi': 'qr_code_2',
      'card': 'credit_card',
      'bank-transfer': 'account_balance',
      'dd': 'description',
      'cheque': 'receipt',
      'online': 'language'
    };
    return icons[mode?.toLowerCase()] || 'payment';
  }

  onViewDetails(payment: DashboardRecentPayment): void {
    this.viewDetails.emit(payment);
  }

  onDownloadReceipt(payment: DashboardRecentPayment): void {
    this.downloadReceipt.emit(payment);
  }
}
