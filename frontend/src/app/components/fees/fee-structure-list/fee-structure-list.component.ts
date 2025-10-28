import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { SharedService } from '../../../services/shared.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { detailExpand } from './fee-structure-list.animations';

interface FeeStructure {
  _id: string;
  code: string;
  name: string;
  program: string;
  department: string;
  year: number;
  semester: number;
  academicYear: string;
  quota: string;
  heads: Array<{
    headId: { name: string; category: string };
    amount: number;
    amountUSD: number;
    taxAmount: number;
  }>;
  totalAmount: number;
  totalUSD: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-fee-structure-list',
  standalone: true,
  animations: [detailExpand],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatMenuModule,
    MatBadgeModule,
    MatExpansionModule
  ],
  templateUrl: './fee-structure-list.component.html',
  styleUrl: './fee-structure-list.component.css'
})
export class FeeStructureListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<FeeStructure>([]);
  displayedColumns: string[] = [
    'code',
    'name',
    'program',
    'year',
    'quota',
    'totalAmount',
    'heads',
    'status',
    'actions'
  ];

  loading = signal<boolean>(false);
  error = signal<string>('');
  
  // Filters
  searchControl = new FormControl('');
  programFilter = new FormControl('');
  yearFilter = new FormControl('');
  semesterFilter = new FormControl('');
  quotaFilter = new FormControl('');
  academicYearFilter = new FormControl('');
  statusFilter = new FormControl('');

  programs = [
    'MBBS', 'BDS', 'BAMS', 'BHMS', 'B.Pharm', 'BSc-Nursing', 'MD', 'MS', 'MDS'
  ];

  years = [1, 2, 3, 4, 5];
  semesters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  quotas = [
    { code: 'puducherry-ut', name: 'Puducherry UT' },
    { code: 'all-india', name: 'All India' },
    { code: 'nri', name: 'NRI' },
    { code: 'self-sustaining', name: 'Self-Sustaining' }
  ];

  academicYears = this.generateAcademicYears();

  totalRecords = signal<number>(0);
  activeCount = signal<number>(0);
  inactiveCount = signal<number>(0);

  expandedElement: FeeStructure | null = null;

  constructor(
    private router: Router,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.loadFeeStructures();
    this.setupFilters();
  }

  setupFilters(): void {
    // Search filter
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(value => {
        this.applyFilter(value || '', 'search');
      });

    // Other filters
    this.programFilter.valueChanges.subscribe(() => this.applyFilters());
    this.yearFilter.valueChanges.subscribe(() => this.applyFilters());
    this.semesterFilter.valueChanges.subscribe(() => this.applyFilters());
    this.quotaFilter.valueChanges.subscribe(() => this.applyFilters());
    this.academicYearFilter.valueChanges.subscribe(() => this.applyFilters());
    this.statusFilter.valueChanges.subscribe(() => this.applyFilters());
  }

  loadFeeStructures(): void {
    this.loading.set(true);
    this.error.set('');

    this.sharedService.getAllFeeStructures().subscribe({
      next: (data: FeeStructure[]) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        
        this.totalRecords.set(data.length);
        this.activeCount.set(data.filter(s => s.isActive).length);
        this.inactiveCount.set(data.filter(s => !s.isActive).length);
        
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading fee structures:', err);
        this.error.set('Failed to load fee structures');
        this.loading.set(false);
      }
    });
  }

  applyFilter(value: string, type: string): void {
    if (type === 'search') {
      this.dataSource.filter = value.trim().toLowerCase();
    }
  }

  applyFilters(): void {
    this.dataSource.filterPredicate = (data: FeeStructure, filter: string) => {
      const programMatch = !this.programFilter.value || data.program === this.programFilter.value;
      const yearMatch = !this.yearFilter.value || data.year === Number(this.yearFilter.value);
      const semesterMatch = !this.semesterFilter.value || data.semester === Number(this.semesterFilter.value);
      const quotaMatch = !this.quotaFilter.value || data.quota === this.quotaFilter.value;
      const academicYearMatch = !this.academicYearFilter.value || data.academicYear === this.academicYearFilter.value;
      
      let statusMatch = true;
      if (this.statusFilter.value === 'active') {
        statusMatch = data.isActive === true;
      } else if (this.statusFilter.value === 'inactive') {
        statusMatch = data.isActive === false;
      }

      return programMatch && yearMatch && semesterMatch && quotaMatch && academicYearMatch && statusMatch;
    };

    this.dataSource.filter = 'trigger'; // Trigger filter
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.programFilter.setValue('');
    this.yearFilter.setValue('');
    this.semesterFilter.setValue('');
    this.quotaFilter.setValue('');
    this.academicYearFilter.setValue('');
    this.statusFilter.setValue('');
    this.dataSource.filter = '';
  }

  createNew(): void {
    this.router.navigate(['/fees/fee-structure/create']);
  }

  viewDetails(structure: FeeStructure): void {
    this.expandedElement = this.expandedElement === structure ? null : structure;
  }

  editStructure(id: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/fees/fee-structure/edit', id]);
  }

  cloneStructure(structure: FeeStructure, event: Event): void {
    event.stopPropagation();
    
    if (confirm(`Clone fee structure "${structure.name}"?`)) {
      this.sharedService.cloneFeeStructure(structure._id).subscribe({
        next: (newStructure: any) => {
          alert('Fee structure cloned successfully!');
          this.loadFeeStructures();
          this.router.navigate(['/fees/fee-structure/edit', newStructure._id]);
        },
        error: (err: any) => {
          console.error('Error cloning fee structure:', err);
          alert('Failed to clone fee structure');
        }
      });
    }
  }

  deleteStructure(id: string, name: string, event: Event): void {
    event.stopPropagation();
    
    if (confirm(`Are you sure you want to delete "${name}"?\n\nThis action cannot be undone.`)) {
      this.sharedService.deleteFeeStructure(id).subscribe({
        next: () => {
          alert('Fee structure deleted successfully!');
          this.loadFeeStructures();
        },
        error: (err: any) => {
          console.error('Error deleting fee structure:', err);
          alert('Failed to delete fee structure');
        }
      });
    }
  }

  toggleStatus(structure: FeeStructure, event: Event): void {
    event.stopPropagation();
    
    const newStatus = !structure.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    
    console.log('Toggle status called:', {
      id: structure._id,
      currentStatus: structure.isActive,
      newStatus: newStatus,
      action: action
    });
    
    if (confirm(`Are you sure you want to ${action} "${structure.name}"?`)) {
      console.log('User confirmed, calling API...');
      
      this.sharedService.updateFeeStructureStatus(structure._id, newStatus).subscribe({
        next: (response) => {
          console.log('API Response:', response);
          alert(`Fee structure ${action}d successfully!`);
          
          // Update local data
          structure.isActive = newStatus;
          
          // Update counts
          this.activeCount.set(this.dataSource.data.filter(s => s.isActive).length);
          this.inactiveCount.set(this.dataSource.data.filter(s => !s.isActive).length);
          
          // Trigger change detection
          this.dataSource.data = [...this.dataSource.data];
        },
        error: (err: any) => {
          console.error(`Error ${action}ing fee structure:`, err);
          console.error('Full error object:', JSON.stringify(err, null, 2));
          
          let errorMessage = `Failed to ${action} fee structure.`;
          if (err.status === 401) {
            errorMessage += ' Please login again.';
          } else if (err.status === 404) {
            errorMessage += ' Fee structure not found.';
          } else if (err.error?.message) {
            errorMessage += ` ${err.error.message}`;
          } else if (err.message) {
            errorMessage += ` ${err.message}`;
          }
          
          alert(errorMessage);
        }
      });
    } else {
      console.log('User cancelled toggle');
    }
  }

  exportToExcel(): void {
    // Implement export functionality
    alert('Export to Excel feature coming soon!');
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatUSD(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getQuotaDisplayName(code: string): string {
    return this.quotas.find(q => q.code === code)?.name || code;
  }

  getQuotaColor(code: string): string {
    const colors: { [key: string]: string } = {
      'puducherry-ut': '#2196F3',
      'all-india': '#4CAF50',
      'nri': '#FF9800',
      'self-sustaining': '#9C27B0'
    };
    return colors[code] || '#757575';
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'academic': '#1976d2',
      'hostel': '#388e3c',
      'miscellaneous': '#f57c00'
    };
    return colors[category] || '#757575';
  }

  private generateAcademicYears(): string[] {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = -1; i <= 3; i++) {
      const startYear = currentYear + i;
      const endYear = startYear + 1;
      years.push(`${startYear}-${endYear}`);
    }
    return years;
  }
}
