import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DashboardTotalCollection } from '../../../../models/fee-management.model';

@Component({
  selector: 'app-total-collection-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './total-collection-widget.component.html',
  styleUrl: './total-collection-widget.component.css'
})
export class TotalCollectionWidgetComponent {
  @Input() data: DashboardTotalCollection | null = null;
  @Input() loading = false;

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  formatUSD(amount: number): string {
    return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }

  getTrendIcon(): string {
    if (!this.data?.trend) return 'trending_flat';
    return this.data.trend.direction === 'up' ? 'trending_up' : 
           this.data.trend.direction === 'down' ? 'trending_down' : 'trending_flat';
  }

  getTrendClass(): string {
    if (!this.data?.trend) return 'neutral';
    return this.data.trend.direction === 'up' ? 'positive' : 
           this.data.trend.direction === 'down' ? 'negative' : 'neutral';
  }
}
