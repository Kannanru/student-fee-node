/**
 * Fee Management Models
 * 
 * TypeScript interfaces for Fee Module Phase 1 & 2:
 * - QuotaConfig
 * - FeeHead
 * - FeePlan
 * - StudentBill
 * - Payment
 * - Dashboard
 */

// ============================================================================
// QuotaConfig Model
// ============================================================================

export interface QuotaConfig {
  _id: string;
  code: 'puducherry-ut' | 'all-india' | 'nri' | 'self-sustaining';
  name: string;
  displayName: string;
  description?: string;
  defaultCurrency: 'INR' | 'USD';
  requiresUSDTracking: boolean;
  seatAllocation?: number;
  eligibilityCriteria?: string;
  priority: number;
  active: boolean;
  metadata: {
    color: string;
    icon: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// FeeHead Model
// ============================================================================

export interface FeeHead {
  _id: string;
  name: string;
  code: string;
  category: 'academic' | 'hostel' | 'miscellaneous';
  frequency: 'one-time' | 'annual' | 'semester';
  isRefundable: boolean;
  defaultAmount: number;
  description?: string;
  displayOrder: number;
  taxability: boolean;
  taxPercentage: number;
  glCode?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  formattedName?: string; // Virtual field
}

// ============================================================================
// FeePlan Model
// ============================================================================

export interface FeePlanHead {
  headId: string | FeeHead;
  amount: number;
  amountUSD: number;
  taxPercentage: number;
  taxAmount: number;
  totalAmount: number;
}

export interface FeePlanDueDate {
  installmentNumber: number;
  dueDate: Date;
  amount: number;
  amountUSD: number;
  description: string;
}

export interface FeePlan {
  _id: string;
  code: string;
  name: string;
  description?: string;
  program: string;
  department: string;
  year: number;
  semester: number;
  academicYear: string;
  quota: 'puducherry-ut' | 'all-india' | 'nri' | 'self-sustaining';
  quotaRef?: string | QuotaConfig;
  heads: FeePlanHead[];
  totalAmount: number;
  totalAmountUSD: number;
  mode: 'full' | '2' | '4';
  dueDates: FeePlanDueDate[];
  version: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  supersededBy?: string | FeePlan;
  locked: boolean;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  formattedName?: string; // Virtual field
}

// ============================================================================
// StudentBill Model
// ============================================================================

export interface StudentBillHead {
  headId: string | FeeHead;
  headCode: string;
  headName: string;
  amount: number;
  amountUSD: number;
  taxPercentage: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
}

export interface StudentBillPayment {
  paymentId: string;
  receiptNumber: string;
  amount: number;
  amountUSD: number;
  paymentDate: Date;
  paymentMode: string;
}

export interface StudentBillAdjustment {
  adjustmentType: 'waiver' | 'discount' | 'scholarship' | 'penalty' | 'refund' | 'other';
  amount: number;
  reason: string;
  approvedBy?: string;
  approvedAt: Date;
  notes?: string;
}

export interface StudentBill {
  _id: string;
  billNumber: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  academicYear: string;
  program: string;
  department: string;
  year: number;
  semester: number;
  quota: 'puducherry-ut' | 'all-india' | 'nri' | 'self-sustaining';
  planId: string | FeePlan;
  planCode: string;
  planVersion: number;
  heads: StudentBillHead[];
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  totalAmountUSD: number;
  paidAmountUSD: number;
  balanceAmountUSD: number;
  dueDate: Date;
  isOverdue: boolean;
  daysOverdue: number;
  penaltyAmount: number;
  status: 'pending' | 'partially-paid' | 'paid' | 'overdue' | 'waived' | 'cancelled';
  payments: StudentBillPayment[];
  adjustments: StudentBillAdjustment[];
  billedDate: Date;
  lastPaymentDate?: Date;
  paidInFullDate?: Date;
  generatedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  paymentPercentage?: number; // Virtual field
}

// ============================================================================
// Payment Model
// ============================================================================

export interface PaymentUPIDetails {
  transactionId: string;
  upiId: string;
  provider: string;
}

export interface PaymentCardDetails {
  last4Digits: string;
  cardType: 'debit' | 'credit';
  cardNetwork: 'Visa' | 'Mastercard' | 'RuPay' | 'AmEx';
  bankName: string;
}

export interface PaymentBankTransferDetails {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  transferDate: Date;
  utrNumber: string;
}

export interface PaymentDDDetails {
  ddNumber: string;
  ddDate: Date;
  bankName: string;
  branchName: string;
}

export interface PaymentChequeDetails {
  chequeNumber: string;
  chequeDate: Date;
  bankName: string;
  branchName: string;
  clearanceStatus: 'pending' | 'cleared' | 'bounced';
  clearanceDate?: Date;
}

export interface PaymentGatewayDetails {
  gatewayName: 'razorpay' | 'hdfc' | 'paytm' | 'other';
  gatewayTransactionId: string;
  orderId: string;
  gatewayFee: number;
}

export interface PaymentHeadPaid {
  headId: string | FeeHead;
  headCode: string;
  headName: string;
  amount: number;
}

export interface PaymentRefundDetails {
  refunded: boolean;
  refundAmount: number;
  refundDate?: Date;
  refundReason?: string;
  refundedBy?: string;
  refundRef?: string;
}

export interface PaymentAuditLog {
  action: 'created' | 'confirmed' | 'cancelled' | 'refunded' | 'printed' | 'modified';
  performedBy: string;
  performedAt: Date;
  details: string;
  ipAddress?: string;
}

export interface Payment {
  _id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  billId: string | StudentBill;
  billNumber: string;
  amount: number;
  amountUSD: number;
  currency: 'INR' | 'USD';
  paymentMode: 'cash' | 'upi' | 'card' | 'bank-transfer' | 'dd' | 'cheque' | 'online';
  upiDetails?: PaymentUPIDetails;
  cardDetails?: PaymentCardDetails;
  bankTransferDetails?: PaymentBankTransferDetails;
  ddDetails?: PaymentDDDetails;
  chequeDetails?: PaymentChequeDetails;
  gatewayDetails?: PaymentGatewayDetails;
  headsPaid: PaymentHeadPaid[];
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled' | 'refunded';
  paymentDate: Date;
  confirmedAt?: Date;
  collectedBy: string;
  collectedByName: string;
  collectionLocation: string;
  settlementAmount: number;
  transactionFee: number;
  settledOn?: Date;
  settlementRef?: string;
  refundDetails?: PaymentRefundDetails;
  receiptGenerated: boolean;
  receiptGeneratedAt?: Date;
  receiptPDF?: string;
  receiptPrinted: boolean;
  auditLog: PaymentAuditLog[];
  remarks?: string;
  studentRemarks?: string;
  academicYear: string;
  semester?: number;
  quota?: 'puducherry-ut' | 'all-india' | 'nri' | 'self-sustaining';
  createdAt: Date;
  updatedAt: Date;
  formattedAmount?: string; // Virtual field
  paymentMethodDisplay?: string; // Virtual field
}

// ============================================================================
// Dashboard Models
// ============================================================================

export interface DashboardTotalCollection {
  amount: number;
  amountUSD: number;
  paymentsCount: number;
  studentsCount: number;
  trend?: {
    percentage: string;
    direction: 'up' | 'down';
    previousAmount: number;
  };
}

export interface DashboardPendingAmount {
  amount: number;
  amountUSD: number;
  studentsCount: number;
  overdueAmount: number;
  overdueCount: number;
}

export interface DashboardStudentStatus {
  paid: number;
  pending: number;
  partiallyPaid: number;
  overdue: number;
  total: number;
}

export interface DashboardFeeStats {
  totalCollection: DashboardTotalCollection;
  pendingAmount: DashboardPendingAmount;
  studentStatus: DashboardStudentStatus;
  averagePayment: number;
  filters: {
    academicYear?: string;
    department?: string;
    semester?: number;
    quota?: string;
  };
  generatedAt: Date;
}

export interface DashboardRecentPayment {
  receiptNumber: string;
  studentName: string;
  registerNumber: string;
  department: string;
  year: string | number;
  amount: number;
  amountUSD: number;
  currency: string;
  paymentMode: string;
  paymentDate: Date;
  collectedBy: string;
  headsPaid: PaymentHeadPaid[];
}

export interface DashboardDefaulter {
  billNumber: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  department: string;
  year: number;
  semester: number;
  quota: string;
  balanceAmount: number;
  balanceAmountUSD: number;
  dueDate: Date;
  daysOverdue: number;
  penaltyAmount: number;
  lastPaymentDate?: Date;
  contactNumber?: string;
  guardianPhone?: string;
  academicYear: string;
}

export interface CollectionByHead {
  headCode: string;
  headName: string;
  amount: number;
  count: number;
  percentage: string;
}

export interface CollectionByMode {
  mode: string;
  amount: number;
  count: number;
  percentage: string;
}

export interface CollectionByQuota {
  quota: string;
  amount: number;
  amountUSD: number;
  count: number;
  percentage: string;
}

export interface DailyTrend {
  date: string;
  amount: number;
  count: number;
}

export interface DashboardCollectionSummary {
  byHead: CollectionByHead[];
  byMode: CollectionByMode[];
  byQuota: CollectionByQuota[];
  dailyTrend: DailyTrend[] | null;
  summary: {
    totalAmount: number;
    totalPayments: number;
  };
  filters: {
    academicYear?: string;
    startDate?: string;
    endDate?: string;
  };
  generatedAt: Date;
}

export interface DashboardOverview {
  stats: DashboardFeeStats;
  recentPayments: DashboardRecentPayment[];
  defaulters: DashboardDefaulter[];
  collectionSummary: DashboardCollectionSummary;
  filters: any;
  generatedAt: Date;
}

// ============================================================================
// API Response Wrappers
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
}
