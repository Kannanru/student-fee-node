import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DashboardCollectionSummary } from '../../../../models/fee-management.model';

@Component({
  selector: 'app-collection-summary-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './collection-summary-panel.component.html',
  styleUrl: './collection-summary-panel.component.css'
})
export class CollectionSummaryPanelComponent {
  @Input() summary: DashboardCollectionSummary | null = null;
  @Input() loading = false;

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  getMaxAmount(items: any[]): number {
    if (!items || items.length === 0) return 0;
    return Math.max(...items.map(item => item.amount));
  }

  getBarWidth(amount: number, maxAmount: number): string {
    if (maxAmount === 0) return '0%';
    return `${(amount / maxAmount) * 100}%`;
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

  getQuotaColor(quota: string): string {
    const colors: { [key: string]: string } = {
      'puducherry-ut': '#1976d2',
      'all-india': '#388e3c',
      'nri': '#f57c00',
      'self-sustaining': '#7b1fa2'
    };
    return colors[quota?.toLowerCase()] || '#9e9e9e';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
    });
  }
}
