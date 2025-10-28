// src/app/services/fee.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { 
  FeeHead, 
  FeeRecord,
  FeeStructure, 
  StudentFeeDetails, 
  Payment, 
  PaymentRequest, 
  PaymentHistory 
} from '../models/fee.model';

@Injectable({
  providedIn: 'root'
})
export class FeeService {
  
  constructor(private apiService: ApiService) {}

  // Fee Heads Management
  getFeeHeads(): Observable<FeeHead[]> {
    return this.apiService.get<FeeHead[]>('/fee-heads');
  }

  createFeeHead(feeHead: Partial<FeeHead>): Observable<FeeHead> {
    return this.apiService.post<FeeHead>('/fee-heads', feeHead);
  }

  // Fee Structure Management
  createFeeStructure(feeStructure: FeeStructure): Observable<any> {
    return this.apiService.post('/fees/structure', feeStructure);
  }

  // Student Fee Details
  getStudentFeeDetails(studentId: string, academicYear?: string, semester?: string): Observable<StudentFeeDetails> {
    const params: any = {};
    if (academicYear) params.academicYear = academicYear;
    if (semester) params.semester = semester;
    
    return this.apiService.get<StudentFeeDetails>(`/fees/student/${studentId}`, params);
  }

  // Payment Processing
  processPayment(feeId: string, paymentData: PaymentRequest): Observable<Payment> {
    return this.apiService.post<Payment>(`/fees/${feeId}/payment`, paymentData);
  }

  // Payment History
  getPaymentHistory(studentId: string): Observable<PaymentHistory> {
    return this.apiService.get<PaymentHistory>(`/fees/payment-history/${studentId}`);
  }

  // Get Student Fee Records (for student detail component)
  getStudentFeeRecords(studentId: string): Observable<FeeRecord[]> {
    return this.apiService.get<any>(`/students/${studentId}/fees`).pipe(
      map((response: any) => {
        // Handle various response formats
        if (Array.isArray(response)) {
          return response;
        }
        if (response?.fees && Array.isArray(response.fees)) {
          return response.fees;
        }
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        // Return empty array if no valid data
        return [];
      }),
      catchError((error) => {
        console.error('Error fetching fee records:', error);
        // Return empty array on error instead of throwing
        return of([]);
      })
    );
  }

  // General Payments
  getPayments(): Observable<Payment[]> {
    return this.apiService.get<Payment[]>('/payments');
  }

  createPayment(payment: Partial<Payment>): Observable<Payment> {
    return this.apiService.post<Payment>('/payments', payment);
  }

  // Student Fee Details
  getStudentFees(studentId: string): Observable<any> {
    return this.apiService.get<any>(`/students/${studentId}/fees`);
  }

  // Fee Collection Summary
  getFeeCollectionSummary(academicYear: string): Observable<any> {
    return this.apiService.get<any>(`/fees/collection-summary?academicYear=${academicYear}`);
  }

  // All Payments with filters
  getAllPayments(filters: any): Observable<any> {
    return this.apiService.get<any>(`/payments/all`, filters);
  }

  // Fee Defaulters
  getFeeDefaulters(academicYear: string, daysPastDue: number): Observable<any> {
    return this.apiService.get<any>(`/fees/defaulters?academicYear=${academicYear}&daysPastDue=${daysPastDue}`);
  }

  // Fee Plans
  getFeePlans(): Observable<any[]> {
    return this.apiService.get<any[]>('/fee-plans');
  }

  createFeePlan(feePlan: any): Observable<any> {
    return this.apiService.post('/fee-plans', feePlan);
  }

  // Installment Schedules
  getInstallmentSchedules(): Observable<any[]> {
    return this.apiService.get<any[]>('/installment-schedules');
  }

  // Invoices
  getInvoices(): Observable<any[]> {
    return this.apiService.get<any[]>('/invoices');
  }

  // Refunds
  getRefunds(): Observable<any[]> {
    return this.apiService.get<any[]>('/refunds');
  }

  // Concessions
  getConcessions(): Observable<any[]> {
    return this.apiService.get<any[]>('/concessions');
  }

  // Penalty Configuration
  createPenaltyConfig(penaltyConfig: any): Observable<any> {
    return this.apiService.post('/penalty-config', penaltyConfig);
  }

  // Payment Gateway Integration
  
  // Razorpay
  createRazorpayOrder(orderData: { feeId: string; amount: number; currency: string }): Observable<any> {
    return this.apiService.post('/payments/razorpay/order', orderData);
  }

  verifyRazorpaySignature(verificationData: any): Observable<any> {
    return this.apiService.post('/payments/razorpay/verify', verificationData);
  }

  // HDFC
  initiateHdfcPayment(paymentData: { 
    studentId: string; 
    feeId: string; 
    amount: number; 
    redirectUrl: string 
  }): Observable<any> {
    return this.apiService.post('/payments/hdfc/initiate', paymentData);
  }

  // Reports
  getCollectionsReport(filters?: any): Observable<any> {
    return this.apiService.get('/reports/collections', filters);
  }

  // Optional server-side export for payments
  exportPaymentsCsv(filters?: any): Observable<Blob> {
    return this.apiService.getBlob('/payments/export.csv', filters);
  }

  // Get semester-wise fee details for a student
  getStudentSemesterFees(studentId: string, semester: number): Observable<any> {
    return this.apiService.get(`/students/${studentId}/semesters/${semester}/fees`);
  }
}