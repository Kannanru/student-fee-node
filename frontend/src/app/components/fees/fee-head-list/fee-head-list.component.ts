import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-fee-head-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatMenuModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDividerModule
  ],
  templateUrl: './fee-head-list.component.html',
  styleUrl: './fee-head-list.component.css'
})
export class FeeHeadListComponent implements OnInit {
  feeHeads = signal<any[]>([]);
  loading = signal(false);
  loadingMore = signal(false);
  searchTerm = signal('');
  selectedCategory = signal('all');
  selectedStatus = signal('all');
  
  // Pagination state
  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);
  pageSize = 10;
  hasMore = computed(() => this.currentPage() < this.totalPages());
  
  displayedColumns = ['name', 'code', 'category', 'frequency', 'taxability', 'defaultAmount', 'status', 'actions'];
  
  categories = ['all', 'academic', 'hostel', 'miscellaneous'];
  statuses = ['all', 'active', 'inactive'];
  
  // Computed signals
  filteredFeeHeads = computed(() => {
    const heads = this.feeHeads();
    
    // Ensure heads is an array
    if (!Array.isArray(heads)) {
      return [];
    }
    
    let filtered = heads;
    
    if (this.searchTerm()) {
      const search = this.searchTerm().toLowerCase();
      filtered = filtered.filter(head =>
        head.name?.toLowerCase().includes(search) ||
        head.code?.toLowerCase().includes(search)
      );
    }
    
    if (this.selectedCategory() !== 'all') {
      filtered = filtered.filter(head => head.category === this.selectedCategory());
    }
    
    if (this.selectedStatus() !== 'all') {
      filtered = filtered.filter(head => head.status === this.selectedStatus());
    }
    
    return filtered;
  });
  
  totalCount = computed(() => {
    return this.totalItems() || this.feeHeads().length;
  });
  
  activeCount = computed(() => {
    const heads = this.feeHeads();
    return Array.isArray(heads) ? heads.filter(h => h.status === 'active').length : 0;
  });
  
  inactiveCount = computed(() => {
    const heads = this.feeHeads();
    return Array.isArray(heads) ? heads.filter(h => h.status === 'inactive').length : 0;
  });

  constructor(
    private sharedService: SharedService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFeeHeads();
  }

  loadFeeHeads(reset: boolean = true): void {
    // Prevent duplicate calls
    if (this.loading() || this.loadingMore()) {
      return;
    }

    if (reset) {
      this.loading.set(true);
      this.currentPage.set(0); // Will load page 1
      this.feeHeads.set([]);
    } else {
      // Check if we already have all data
      if (!this.hasMore()) {
        return;
      }
      this.loadingMore.set(true);
    }

    const page = reset ? 1 : this.currentPage() + 1;
    
    console.log(`Loading page ${page}...`);
    
    this.sharedService.getFeeHeadsPaginated(page, this.pageSize).subscribe({
      next: (response) => {
        console.log('Fee heads loaded:', response);
        console.log(`Page ${response.page} of ${response.pages}, Total: ${response.total}`);
        
        const newHeads = Array.isArray(response.data) ? response.data : [];
        
        if (reset) {
          this.feeHeads.set(newHeads);
        } else {
          // Append only new items (prevent duplicates)
          const existingIds = new Set(this.feeHeads().map((h: any) => h._id));
          const uniqueNewHeads = newHeads.filter((h: any) => !existingIds.has(h._id));
          this.feeHeads.set([...this.feeHeads(), ...uniqueNewHeads]);
        }
        
        // Update pagination state from response
        this.currentPage.set(response.page || page);
        this.totalPages.set(response.pages || 1);
        this.totalItems.set(response.total || 0);
        
        console.log(`Current page: ${this.currentPage()}, Total pages: ${this.totalPages()}, Has more: ${this.hasMore()}`);
        
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: (error) => {
        console.error('Error loading fee heads:', error);
        this.snackBar.open('Failed to load fee heads', 'Close', { duration: 3000 });
        if (reset) {
          this.feeHeads.set([]);
        }
        this.loading.set(false);
        this.loadingMore.set(false);
      }
    });
  }

  loadMoreFeeHeads(): void {
    if (!this.hasMore() || this.loadingMore()) {
      return;
    }
    this.loadFeeHeads(false);
  }

  onScroll(event: any): void {
    const element = event.target;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    const atBottom = scrollHeight - scrollTop <= clientHeight + 100;
    
    // Debug logging
    if (atBottom) {
      console.log('At bottom:', {
        hasMore: this.hasMore(),
        loadingMore: this.loadingMore(),
        currentPage: this.currentPage(),
        totalPages: this.totalPages()
      });
    }
    
    if (atBottom && this.hasMore() && !this.loadingMore() && !this.loading()) {
      console.log('Triggering load more...');
      this.loadMoreFeeHeads();
    }
  }

  createFeeHead(): void {
    this.router.navigate(['/fees/master/fee-head/create']);
  }

  editFeeHead(id: string): void {
    this.router.navigate(['/fees/master/fee-head/edit', id]);
  }

  toggleStatus(feeHead: any): void {
    this.sharedService.toggleFeeHeadStatus(feeHead._id).subscribe({
      next: (updated) => {
        const index = this.feeHeads().findIndex(h => h._id === feeHead._id);
        if (index !== -1) {
          const heads = [...this.feeHeads()];
          heads[index] = updated;
          this.feeHeads.set(heads);
        }
        this.snackBar.open('Fee head status updated', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error toggling status:', error);
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteFeeHead(feeHead: any): void {
    if (!confirm(`Are you sure you want to delete "${feeHead.name}"?`)) {
      return;
    }

    this.sharedService.deleteFeeHead(feeHead._id).subscribe({
      next: () => {
        this.feeHeads.set(this.feeHeads().filter(h => h._id !== feeHead._id));
        this.snackBar.open('Fee head deleted successfully', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error deleting fee head:', error);
        this.snackBar.open('Failed to delete fee head', 'Close', { duration: 3000 });
      }
    });
  }

  getCategoryDisplayName(category: string): string {
    const map: any = {
      'academic': 'Academic',
      'hostel': 'Hostel',
      'miscellaneous': 'Miscellaneous'
    };
    return map[category] || category;
  }

  getFrequencyDisplayName(frequency: string): string {
    const map: any = {
      'one-time': 'One Time',
      'annual': 'Annual',
      'semester': 'Semester'
    };
    return map[frequency] || frequency;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set('all');
    this.selectedStatus.set('all');
    this.loadFeeHeads(true);
  }
}
