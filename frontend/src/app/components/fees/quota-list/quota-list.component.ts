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
import { MatDividerModule } from '@angular/material/divider';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-quota-list',
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
    MatDividerModule
  ],
  templateUrl: './quota-list.component.html',
  styleUrl: './quota-list.component.css'
})
export class QuotaListComponent implements OnInit {
  quotas = signal<any[]>([]);
  loading = signal(false);
  searchTerm = signal('');
  
  displayedColumns = ['name', 'code', 'currency', 'seatAllocation', 'priority', 'status', 'actions'];
  
  filteredQuotas = computed(() => {
    let filtered = this.quotas();
    
    if (this.searchTerm()) {
      const search = this.searchTerm().toLowerCase();
      filtered = filtered.filter(quota =>
        quota.name.toLowerCase().includes(search) ||
        quota.code.toLowerCase().includes(search) ||
        quota.displayName.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  });
  
  totalCount = computed(() => this.quotas().length);
  activeCount = computed(() => this.quotas().filter(q => q.active).length);
  inactiveCount = computed(() => this.quotas().filter(q => !q.active).length);

  constructor(
    private sharedService: SharedService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadQuotas();
  }

  loadQuotas(): void {
    this.loading.set(true);
    this.sharedService.getAllQuotas().subscribe({
      next: (data) => {
        this.quotas.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading quotas:', error);
        this.snackBar.open('Failed to load quotas', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  createQuota(): void {
    this.router.navigate(['/fees/master/quota/create']);
  }

  editQuota(id: string): void {
    this.router.navigate(['/fees/master/quota/edit', id]);
  }

  toggleStatus(quota: any): void {
    this.sharedService.toggleQuotaStatus(quota._id).subscribe({
      next: (updated) => {
        const index = this.quotas().findIndex(q => q._id === quota._id);
        if (index !== -1) {
          const quotas = [...this.quotas()];
          quotas[index] = updated;
          this.quotas.set(quotas);
        }
        this.snackBar.open('Quota status updated', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error toggling status:', error);
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteQuota(quota: any): void {
    if (!confirm(`Are you sure you want to delete "${quota.name}"?`)) {
      return;
    }

    this.sharedService.deleteQuota(quota._id).subscribe({
      next: () => {
        this.quotas.set(this.quotas().filter(q => q._id !== quota._id));
        this.snackBar.open('Quota deleted successfully', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error deleting quota:', error);
        this.snackBar.open('Failed to delete quota', 'Close', { duration: 3000 });
      }
    });
  }
}
