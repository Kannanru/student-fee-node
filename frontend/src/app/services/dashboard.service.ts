/**
 * Dashboard Service
 * 
 * Angular service for Fee Management Dashboard API calls
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  ApiResponse,
  DashboardFeeStats,
  DashboardRecentPayment,
  DashboardDefaulter,
  DashboardCollectionSummary,
  DashboardOverview
} from '../models/fee-management.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:5000/api/dashboard';

  constructor(private http: HttpClient) {}

  /**
   * Get fee statistics for dashboard widgets
   */
  getFeeStats(filters?: {
    academicYear?: string;
    department?: string;
    semester?: number;
    quota?: string;
  }): Observable<ApiResponse<DashboardFeeStats>> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.academicYear) params = params.set('academicYear', filters.academicYear);
      if (filters.department) params = params.set('department', filters.department);
      if (filters.semester) params = params.set('semester', filters.semester.toString());
      if (filters.quota) params = params.set('quota', filters.quota);
    }

    return this.http.get<ApiResponse<DashboardFeeStats>>(`${this.apiUrl}/fee-stats`, { params });
  }

  /**
   * Get recent payments list
   */
  getRecentPayments(
    limit: number = 10,
    filters?: {
      academicYear?: string;
      quota?: string;
      department?: string;
    }
  ): Observable<{ success: boolean; data: DashboardRecentPayment[]; count: number }> {
    let params = new HttpParams().set('limit', limit.toString());
    
    if (filters) {
      if (filters.academicYear) params = params.set('academicYear', filters.academicYear);
      if (filters.quota) params = params.set('quota', filters.quota);
      if (filters.department) params = params.set('department', filters.department);
    }

    return this.http.get<{ success: boolean; data: DashboardRecentPayment[]; count: number }>(
      `${this.apiUrl}/recent-payments`,
      { params }
    );
  }

  /**
   * Get fee defaulters (overdue students)
   */
  getDefaulters(
    limit: number = 10,
    filters?: {
      academicYear?: string;
      department?: string;
      year?: number;
      quota?: string;
      minDaysOverdue?: number;
    }
  ): Observable<{ success: boolean; data: DashboardDefaulter[]; count: number; totalOverdueAmount: number }> {
    let params = new HttpParams().set('limit', limit.toString());
    
    if (filters) {
      if (filters.academicYear) params = params.set('academicYear', filters.academicYear);
      if (filters.department) params = params.set('department', filters.department);
      if (filters.year) params = params.set('year', filters.year.toString());
      if (filters.quota) params = params.set('quota', filters.quota);
      if (filters.minDaysOverdue) params = params.set('minDaysOverdue', filters.minDaysOverdue.toString());
    }

    return this.http.get<{ success: boolean; data: DashboardDefaulter[]; count: number; totalOverdueAmount: number }>(
      `${this.apiUrl}/defaulters`,
      { params }
    );
  }

  /**
   * Get collection summary (by head, mode, quota)
   */
  getCollectionSummary(filters?: {
    academicYear?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<ApiResponse<DashboardCollectionSummary>> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.academicYear) params = params.set('academicYear', filters.academicYear);
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }

    return this.http.get<ApiResponse<DashboardCollectionSummary>>(
      `${this.apiUrl}/collection-summary`,
      { params }
    );
  }

  /**
   * Get complete dashboard overview (all data in one call)
   * More efficient than making 4 separate API calls
   */
  getDashboardOverview(filters?: {
    academicYear?: string;
    department?: string;
    semester?: number;
    quota?: string;
  }): Observable<ApiResponse<DashboardOverview>> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.academicYear) params = params.set('academicYear', filters.academicYear);
      if (filters.department) params = params.set('department', filters.department);
      if (filters.semester) params = params.set('semester', filters.semester.toString());
      if (filters.quota) params = params.set('quota', filters.quota);
    }

    return this.http.get<ApiResponse<DashboardOverview>>(`${this.apiUrl}/overview`, { params });
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: 'INR' | 'USD' = 'INR'): string {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    } else {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }

  /**
   * Format payment mode for display
   */
  formatPaymentMode(mode: string): string {
    const modeMap: { [key: string]: string } = {
      'cash': 'Cash',
      'upi': 'UPI',
      'card': 'Card',
      'bank-transfer': 'Bank Transfer',
      'dd': 'Demand Draft',
      'cheque': 'Cheque',
      'online': 'Online Payment'
    };
    return modeMap[mode] || mode;
  }

  /**
   * Get quota display name
   */
  getQuotaDisplayName(quota: string): string {
    const quotaMap: { [key: string]: string } = {
      'puducherry-ut': 'Puducherry UT',
      'all-india': 'All India',
      'nri': 'NRI',
      'self-sustaining': 'Self-Sustaining'
    };
    return quotaMap[quota] || quota;
  }

  /**
   * Get quota color
   */
  getQuotaColor(quota: string): string {
    const colorMap: { [key: string]: string } = {
      'puducherry-ut': '#1976d2',
      'all-india': '#388e3c',
      'nri': '#f57c00',
      'self-sustaining': '#7b1fa2'
    };
    return colorMap[quota] || '#607d8b';
  }

  /**
   * Calculate days between dates
   */
  getDaysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(new Date(date2).getTime() - new Date(date1).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get current academic year (Aug-July cycle)
   */
  getCurrentAcademicYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12
    
    if (month >= 8) {
      // Aug-Dec: Current year to next year
      return `${year}-${year + 1}`;
    } else {
      // Jan-July: Previous year to current year
      return `${year - 1}-${year}`;
    }
  }

  /**
   * Get academic year list for filters
   */
  getAcademicYears(count: number = 5): string[] {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const startYear = currentYear - i;
      const endYear = startYear + 1;
      years.push(`${startYear}-${endYear}`);
    }
    
    return years;
  }
}
