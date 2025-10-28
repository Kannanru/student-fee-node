// src/app/components/shared/list-view/list-view.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { SharedService, ListItem, ListConfig } from '../../../services/shared.service';

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.css'
})
export class ListViewComponent implements OnInit {
  @Input() title: string = 'List';
  @Input() items: ListItem[] = [];
  @Input() loading: boolean = false;
  @Input() isLoading: boolean = false; // Alternative name for loading
  @Input() emptyMessage: string = 'No items found';
  @Input() searchPlaceholder: string = 'Search...';
  @Input() showAddButton: boolean = true;
  @Input() addButtonText: string = 'Add New';
  @Input() showFilters: boolean = true;
  @Input() showTabs: boolean = false;
  @Input() tabs: { label: string; value: string; count?: number }[] = [];
  @Input() filterOptions: { label: string; value: string; options: any[] }[] = [];
  @Input() itemConfig: any = {};
  
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<any>();
  @Output() tabChange = new EventEmitter<string>();
  @Output() addClick = new EventEmitter<void>();
  @Output() itemClick = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{ action: string; item: any }>();
  @Output() onView = new EventEmitter<string>();
  @Output() onEdit = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();

  searchTerm: string = '';
  selectedFilters: any = {};
  selectedTab: string = '';

  constructor(private sharedService: SharedService) {}

  ngOnInit(): void {
    if (this.tabs && this.tabs.length > 0) {
      this.selectedTab = this.tabs[0].value;
    }
  }

  onSearchChange(searchTerm?: string): void {
    this.searchChange.emit(searchTerm || this.searchTerm);
  }

  onFilterChange(filterKey: string, value: any): void {
    this.selectedFilters[filterKey] = value;
    this.filterChange.emit(this.selectedFilters);
  }

  onTabChange(tab: string): void {
    this.selectedTab = tab;
    this.tabChange.emit(tab);
  }

  getSelectedTabIndex(): number {
    if (!this.tabs || this.tabs.length === 0) return 0;
    const idx = this.tabs.findIndex(t => t.value === this.selectedTab);
    return idx >= 0 ? idx : 0;
  }

  onSelectedIndexChange(index: number): void {
    if (!this.tabs || index < 0 || index >= this.tabs.length) return;
    this.onTabChange(this.tabs[index].value);
  }

  onAddClick(): void {
    this.addClick.emit();
  }

  onItemClick(item: any): void {
    this.itemClick.emit(item);
  }

  onActionClick(action: string, item: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    // Emit specific action events
    switch (action) {
      case 'view':
        this.onView.emit(item.id);
        break;
      case 'edit':
        this.onEdit.emit(item.id);
        break;
      case 'delete':
        this.onDelete.emit(item.id);
        break;
      default:
        this.actionClick.emit({ action, item });
    }
  }

  getItemProperty(item: any, property: string): any {
    return property.split('.').reduce((obj, prop) => obj?.[prop], item);
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'status-active',
      'inactive': 'status-inactive',
      'pending': 'status-pending',
      'suspended': 'status-warning',
      'graduated': 'status-success',
      'paid': 'status-success',
      'overdue': 'status-danger',
      'partial': 'status-warning'
    };
    return statusMap[status?.toLowerCase()] || 'status-default';
  }

  getStatusColor(status: string): string {
    return this.sharedService.getStatusColor(status);
  }

  generateInitials(name: string): string {
    return this.sharedService.generateAvatarInitials(name);
  }

  generateAvatarColor(name: string): string {
    return this.sharedService.generateAvatarColor(name);
  }

  formatDate(date: string | Date): string {
    return this.sharedService.formatDate(date);
  }
}