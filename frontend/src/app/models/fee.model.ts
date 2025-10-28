// src/app/models/fee.model.ts
export interface FeeHead {
  _id: string;
  name: string;
  code: string;
  taxability: boolean;
  status: 'active' | 'inactive';
}

export interface FeeRecord {
  _id: string;
  studentId: string;
  feeType: string;
  totalAmount: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'pending';
  dueDate?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface FeeStructure {
  studentId: string;
  academicYear: string;
  semester: string;
  feeBreakdown: {
    [key: string]: number;
  };
  dueDate: string;
}

export interface StudentFeeDetails {
  _id: string;
  studentId: string;
  academicYear: string;
  semester: string;
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  feeBreakdown: {
    [key: string]: number;
  };
  dueDate: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  studentId: string;
  feeId: string;
  amountPaid: number;
  paymentMode: string;
  transactionId: string;
  receiptNumber: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  amountPaid: number;
  paymentMode: string;
  transactionId: string;
  receiptNumber: string;
}

export interface PaymentHistory {
  payments: Payment[];
  total: number;
}

export interface CreatePaymentRequest {
  studentId: string;
  feeType: FeeType;
  amount: number;
  paymentMode: PaymentMode;
  paymentReference?: string;
  dueDate: Date;
  description?: string;
  paymentDetails?: {
    bankName?: string;
    chequeNumber?: string;
    chequeDate?: Date;
    transactionId?: string;
  };
  remarks?: string;
}

export type PaymentMode = 'cash' | 'bank_transfer' | 'card' | 'cheque' | 'demand_draft' | 'online';

export type FeeType = 'tuition' | 'examination' | 'library' | 'laboratory' | 'clinical' | 'development' | 'hostel' | 'transport' | 'misc' | 'late_fee';

export interface FeeCollectionSummary {
  totalCollection: number;
  totalPending: number;
  totalStudents: number;
  averageFeePerStudent: number;
  collectionByMonth: { month: string; amount: number }[];
  feeBreakdown: { feeType: string; amount: number; percentage: number }[];
}

export interface FeeDefaulter {
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  program: string;
  year: string;
  totalDue: number;
  overdueAmount: number;
  lastPaymentDate: Date | null;
  contactNumber: string;
  parentContact: string;
  daysPastDue: number;
}