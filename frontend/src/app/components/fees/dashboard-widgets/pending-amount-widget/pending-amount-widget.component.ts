import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DashboardPendingAmount } from '../../../../models/fee-management.model';

@Component({
  selector: 'app-pending-amount-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './pending-amount-widget.component.html',
  styleUrl: './pending-amount-widget.component.css'
})
export class PendingAmountWidgetComponent {
  @Input() data: DashboardPendingAmount | null = null;
  @Input() loading = false;

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  formatUSD(amount: number): string {
    return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }

  hasOverdue(): boolean {
    return (this.data?.overdueAmount || 0) > 0;
  }

  getOverduePercentage(): number {
    if (!this.data || this.data.amount === 0) return 0;
    return Math.round((this.data.overdueAmount / this.data.amount) * 100);
  }
}
