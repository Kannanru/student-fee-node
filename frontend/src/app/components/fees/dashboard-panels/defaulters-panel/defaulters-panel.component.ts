import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DashboardDefaulter } from '../../../../models/fee-management.model';

@Component({
  selector: 'app-defaulters-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './defaulters-panel.component.html',
  styleUrl: './defaulters-panel.component.css'
})
export class DefaultersPanelComponent {
  @Input() defaulters: DashboardDefaulter[] = [];
  @Input() loading = false;
  @Output() viewFees = new EventEmitter<DashboardDefaulter>();
  @Output() contact = new EventEmitter<DashboardDefaulter>();
  @Output() sendReminder = new EventEmitter<DashboardDefaulter>();

  displayedColumns: string[] = ['student', 'program', 'dueAmount', 'overdue', 'lastPayment', 'actions'];

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getUrgencyClass(days: number): string {
    if (days > 60) return 'high';
    if (days > 30) return 'medium';
    return 'low';
  }

  getUrgencyLabel(days: number): string {
    if (days > 60) return 'High Priority';
    if (days > 30) return 'Medium';
    return 'Low';
  }

  onViewFees(defaulter: DashboardDefaulter): void {
    this.viewFees.emit(defaulter);
  }

  onContact(defaulter: DashboardDefaulter): void {
    this.contact.emit(defaulter);
  }

  onSendReminder(defaulter: DashboardDefaulter): void {
    this.sendReminder.emit(defaulter);
  }
}
