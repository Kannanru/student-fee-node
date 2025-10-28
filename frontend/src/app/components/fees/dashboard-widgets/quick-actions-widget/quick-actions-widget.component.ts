import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-quick-actions-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './quick-actions-widget.component.html',
  styleUrl: './quick-actions-widget.component.css'
})
export class QuickActionsWidgetComponent {
  @Output() collectPayment = new EventEmitter<void>();
  @Output() viewStructure = new EventEmitter<void>();
  @Output() generateReport = new EventEmitter<void>();
  @Output() viewStudentFees = new EventEmitter<void>();

  actions = [
    {
      icon: 'payment',
      title: 'Collect Payment',
      subtitle: 'Record new payment',
      color: 'primary',
      action: 'collect'
    },
    {
      icon: 'account_balance',
      title: 'Fee Structure',
      subtitle: 'View & manage fees',
      color: 'accent',
      action: 'structure'
    },
    {
      icon: 'assessment',
      title: 'Reports',
      subtitle: 'Generate reports',
      color: 'primary',
      action: 'report'
    },
    {
      icon: 'school',
      title: 'Student Fees',
      subtitle: 'View student details',
      color: 'accent',
      action: 'students'
    }
  ];

  onActionClick(action: string): void {
    switch (action) {
      case 'collect':
        this.collectPayment.emit();
        break;
      case 'structure':
        this.viewStructure.emit();
        break;
      case 'report':
        this.generateReport.emit();
        break;
      case 'students':
        this.viewStudentFees.emit();
        break;
    }
  }
}
