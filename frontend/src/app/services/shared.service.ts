import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ListItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Draft';
  tags?: string[];
  metadata?: { label: string; value: string }[];
  avatar?: string;
  [key: string]: any; // Allow additional properties
}

export interface ListConfig {
  title: string;
  searchPlaceholder: string;
  enableSearch: boolean;
  enableFilter: boolean;
  enableSort: boolean;
  showAddButton: boolean;
  addButtonText: string;
  columns: ListColumn[];
}

export interface ListColumn {
  key: string;
  label: string;
  sortable: boolean;
  width?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private apiUrl = 'http://localhost:5000/api';
  
  constructor(private http: HttpClient) { }

  // Get student bill details
  getStudentBill(studentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/students/${studentId}/fees`);
  }

  // Process payment
  processPayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments`, paymentData);
  }

  // Download receipt
  downloadReceipt(paymentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/payments/${paymentId}/receipt`, {
      responseType: 'blob'
    });
  }

  // Get payment details
  getPaymentDetails(paymentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/payments/${paymentId}`);
  }

  // Fee Structure Management
  getActiveFeeHeads(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fee-heads/active`).pipe(
      map((response: any) => {
        // Handle paginated response with data property
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        // Handle direct array response
        return Array.isArray(response) ? response : [];
      })
    );
  }

  getAllFeeHeads(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fee-heads`).pipe(
      map((response: any) => {
        // Handle paginated response with data property
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        // Handle direct array response
        return Array.isArray(response) ? response : [];
      })
    );
  }

  getFeeHeadsPaginated(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/fee-heads?page=${page}&limit=${limit}`);
  }

  getFeeHead(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/fee-heads/${id}`);
  }

  createFeeHead(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/fee-heads`, data);
  }

  updateFeeHead(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/fee-heads/${id}`, data);
  }

  toggleFeeHeadStatus(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/fee-heads/${id}/status`, {});
  }

  deleteFeeHead(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/fee-heads/${id}`);
  }

  getActiveQuotas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/quota-configs/active`).pipe(
      map((response: any) => {
        // Handle paginated response with data property
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        // Handle direct array response
        return Array.isArray(response) ? response : [];
      })
    );
  }

  getAllQuotas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/quota-configs`).pipe(
      map((response: any) => {
        // Handle paginated response with data property
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        // Handle direct array response
        return Array.isArray(response) ? response : [];
      })
    );
  }

  getQuota(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/quota-configs/${id}`);
  }

  createQuota(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/quota-configs`, data);
  }

  updateQuota(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/quota-configs/${id}`, data);
  }

  toggleQuotaStatus(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/quota-configs/${id}/status`, {});
  }

  deleteQuota(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/quota-configs/${id}`);
  }

  getAllFeeStructures(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fee-plans`).pipe(
      map((response: any) => {
        // Handle paginated response with data property
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        // Handle direct array response
        return Array.isArray(response) ? response : [];
      })
    );
  }

  getFeeStructure(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/fee-plans/${id}`);
  }

  createFeeStructure(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/fee-plans`, data);
  }

  updateFeeStructure(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/fee-plans/${id}`, data);
  }

  deleteFeeStructure(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/fee-plans/${id}`);
  }

  cloneFeeStructure(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/fee-plans/${id}/clone`, {});
  }

  updateFeeStructureStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/fee-plans/${id}/status`, { isActive });
  }

  // Fee Collection APIs
  getAllStudents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/students`).pipe(
      map((response: any) => {
        // Handle paginated response with data property
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        // Handle direct array response
        return Array.isArray(response) ? response : [];
      })
    );
  }

  getStudentFeeStatus(studentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/students/${studentId}/fee-status`);
  }

  // Get all fee structures for a student (matching their program/year/semester/quota)
  getStudentFeeStructures(studentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/students/${studentId}/fee-structures`);
  }

  // Get fee heads with payment status for a specific student and fee structure
  getFeeHeadsWithPaymentStatus(studentId: string, feeStructureId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/students/${studentId}/fee-structures/${feeStructureId}/heads`);
  }

  // Collect fee payment
  collectFee(paymentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/collect-fee`, paymentData);
  }

  createFeePayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/fee-payment`, paymentData);
  }

  // Get receipt data for PDF generation
  getReceiptData(paymentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/receipts/${paymentId}`);
  }

  // Create Razorpay order
  createRazorpayOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/razorpay/create-order`, orderData);
  }

  // Verify Razorpay payment
  verifyRazorpayPayment(verificationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/razorpay/verify-payment`, verificationData);
  }

  // Generate avatar initials
  generateAvatarInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Generate random avatar color
  generateAvatarColor(name: string): string {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
      '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }

  // Format date for display
  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get status badge color
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return '#10b981';
      case 'inactive':
        return '#6b7280';
      case 'pending':
        return '#f59e0b';
      case 'draft':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  }

  // Filter items based on search and filter criteria
  filterItems(items: ListItem[], searchTerm: string, filterCriteria?: any): ListItem[] {
    let filtered = [...items];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply additional filters
    if (filterCriteria) {
      Object.keys(filterCriteria).forEach(key => {
        if (filterCriteria[key] && filterCriteria[key] !== 'all') {
          filtered = filtered.filter(item => item[key] === filterCriteria[key]);
        }
      });
    }

    return filtered;
  }

  // Sort items
  sortItems(items: ListItem[], sortBy: string, sortDirection: 'asc' | 'desc'): ListItem[] {
    return [...items].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date sorting
      if (sortBy === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  // Format phone number
  formatPhoneNumber(phone: string): string {
    if (!phone) return '-';
    // Format Indian phone numbers
    if (phone.startsWith('+91')) {
      return phone;
    }
    if (phone.length === 10) {
      return `+91-${phone}`;
    }
    return phone;
  }

  // ==================== INTERNAL MARKS APIs ====================
  
  // Internal Subjects
  getInternalSubjects(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/internal-subjects`, { params });
  }

  getInternalSubjectById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/internal-subjects/${id}`);
  }

  getSubjectsByDepartmentYear(department: string, year: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/internal-subjects/department/${department}/year/${year}`);
  }

  createInternalSubject(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/internal-subjects`, data);
  }

  updateInternalSubject(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/internal-subjects/${id}`, data);
  }

  deleteInternalSubject(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/internal-subjects/${id}`);
  }

  // Internal Marks
  getInternalMarks(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/internal-marks`, { params });
  }

  getStudentInternalMarks(studentId: string, academicYear?: string): Observable<any> {
    const params: any = academicYear ? { academicYear } : undefined;
    return this.http.get(`${this.apiUrl}/internal-marks/student/${studentId}`, params ? { params } : {});
  }

  getStudentMarksByYear(studentId: string, academicYear: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/internal-marks/student/${studentId}/year/${academicYear}`);
  }

  saveInternalMarks(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/internal-marks`, data);
  }

  bulkSaveInternalMarks(marks: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/internal-marks/bulk`, { marks });
  }

  deleteInternalMarks(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/internal-marks/${id}`);
  }

  // ==================== ACHIEVEMENT METHODS ====================
  
  // Upload achievement image
  uploadAchievementImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/achievements/upload-image`, formData);
  }

  // Get achievements for a specific student
  getStudentAchievements(studentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/achievements/student/${studentId}`);
  }

  // Get all pending achievements (admin only)
  getPendingAchievements(): Observable<any> {
    return this.http.get(`${this.apiUrl}/achievements/pending`);
  }

  // Create new achievement
  createAchievement(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/achievements`, data);
  }

  // Approve achievement (admin only)
  approveAchievement(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/achievements/${id}/approve`, {});
  }

  // Reject achievement (admin only)
  rejectAchievement(id: string, reason?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/achievements/${id}/reject`, { reason });
  }

  // Delete achievement
  deleteAchievement(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/achievements/${id}`);
  }

  // Get achievement by ID
  getAchievementById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/achievements/${id}`);
  }
}
