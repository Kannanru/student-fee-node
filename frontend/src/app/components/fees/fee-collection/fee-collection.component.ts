import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Router } from '@angular/router';

import { SharedService } from '../../../services/shared.service';

interface Student {
  _id: string;
  studentId: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  contactNumber?: string;
  programName?: string;
  program?: string;
  department?: string;
  class?: string;
  section?: string;
  year?: number;
  semester?: string | number;
  quota?: string;
}

interface FeeHead {
  _id: string;
  headId?: string;
  code: string;
  name: string;
  description?: string;
  amount: number;
  amountUSD?: number;
  taxAmount?: number;
  totalAmount?: number;
  taxable?: boolean;
  isPaid?: boolean;
  paidAmount?: number;
  paidDate?: string;
  billNumber?: string;
  invoiceId?: string;
}

interface FeeStructure {
  _id: string;
  code: string;
  name: string;
  description?: string;
  program: string;
  year: number;
  semester: number;
  quota: string;
  academicYear?: string;
  heads: FeeHead[];
  totalAmount: number;
  totalAmountUSD?: number;
  status: string;
}

@Component({
  selector: 'app-fee-collection',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatCheckboxModule,
    MatTableModule,
    MatChipsModule,
    MatBadgeModule,
    MatAutocompleteModule
  ],
  templateUrl: './fee-collection.component.html',
  styleUrl: './fee-collection.component.css'
})
export class FeeCollectionComponent implements OnInit {
  paymentForm: FormGroup;
  studentSearchControl = new FormControl('');
  
  // Step-based workflow signals
  currentStep = signal<number>(1); // 1: Select Student, 2: Select Structure, 3: Select Heads, 4: Payment
  
  // Data signals
  students = signal<Student[]>([]);
  filteredStudents = signal<Student[]>([]);
  selectedStudent = signal<Student | null>(null);
  
  feeStructures = signal<FeeStructure[]>([]);
  selectedFeeStructure = signal<FeeStructure | null>(null);
  
  feeHeads = signal<FeeHead[]>([]);
  selectedFeeHeads = signal<Set<string>>(new Set());
  
  // Loading states
  loading = signal(false);
  loadingStructures = signal(false);
  loadingHeads = signal(false);
  submitting = signal(false);
  lastPaymentId: string | null = null;
  
  // Fine calculation
  fineAmount = signal(0);
  daysDelayed = signal(0);
  finePerDay = signal(0);
  dueDate = signal<Date | null>(null);
  
  // Computed values
  totalAmount = computed(() => {
    const selected = this.selectedFeeHeads();
    const heads = this.feeHeads();
    return heads
      .filter(head => selected.has(head._id) && !head.isPaid)
      .reduce((sum, head) => sum + (head.totalAmount || head.amount || 0), 0);
  });
  
  totalAmountWithFine = computed(() => {
    return this.totalAmount() + this.fineAmount();
  });

  totalFeeHeads = computed(() => this.feeHeads().length);
  paidFeeHeads = computed(() => this.feeHeads().filter(h => h.isPaid).length);
  unpaidFeeHeads = computed(() => this.feeHeads().filter(h => !h.isPaid).length);
  selectedCount = computed(() => this.selectedFeeHeads().size);
  
  allPaid = computed(() => {
    const heads = this.feeHeads();
    return heads.length > 0 && heads.every(h => h.isPaid);
  });

  // Payment modes
  paymentModes = [
    { value: 'cash', label: 'Cash', icon: 'payments' },
    { value: 'online', label: 'Online Payment (Razorpay)', icon: 'payment' }
  ];

  // Razorpay order details
  razorpayOrderId: string | null = null;
  razorpayPaymentId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.paymentForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadStudents();
    this.setupStudentSearch();
  }

  private setupStudentSearch(): void {
    this.studentSearchControl.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.filterStudents(value);
      }
    });
  }

  private filterStudents(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredStudents.set(this.students());
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = this.students().filter(student => {
      const name = this.getStudentDisplayName(student).toLowerCase();
      const id = student.studentId?.toLowerCase() || '';
      const dept = (student.department || student.programName || '').toLowerCase();
      const year = student.year?.toString() || '';
      
      return name.includes(term) || 
             id.includes(term) || 
             dept.includes(term) ||
             year.includes(term);
    });
    this.filteredStudents.set(filtered);
  }

  displayStudentName = (student: Student | null): string => {
    return student ? this.getStudentDisplayName(student) : '';
  };

  clearStudentSearch(): void {
    this.studentSearchControl.setValue('');
    this.filteredStudents.set(this.students());
  }

  private createForm(): FormGroup {
    return this.fb.group({
      studentId: ['', Validators.required],
      feeStructureId: ['', Validators.required],
      paymentMode: ['cash', Validators.required],
      paymentReference: [''],
      transactionId: [''],
      bankName: [''],
      chequeNumber: [''],
      chequeDate: [''],
      remarks: ['']
    });
  }

  // STEP 1: Load and select student
  private loadStudents(): void {
    this.loading.set(true);
    
    this.sharedService.getAllStudents().subscribe({
      next: (response: any) => {
        console.log('Students response:', response);
        const students = Array.isArray(response) ? response : (response?.data || response?.students || []);
        this.students.set(students);
        this.filteredStudents.set(students);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.snackBar.open('Failed to load students', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onStudentSelect(event: any): void {
    const student = event.option?.value;
    if (!student) {
      this.resetStudentSelection();
      return;
    }

    this.selectedStudent.set(student);
    this.paymentForm.patchValue({ studentId: student._id });
    
    // Move to step 2 and load fee structures
    this.currentStep.set(2);
    this.loadFeeStructures(student._id);
  }

  resetStudentSelection(): void {
    this.selectedStudent.set(null);
    this.feeStructures.set([]);
    this.selectedFeeStructure.set(null);
    this.feeHeads.set([]);
    this.selectedFeeHeads.set(new Set());
    this.currentStep.set(1);
    this.paymentForm.reset();
  }

  // STEP 2: Load and select fee structure
  private loadFeeStructures(studentId: string): void {
    this.loadingStructures.set(true);
    
    this.sharedService.getStudentFeeStructures(studentId).subscribe({
      next: (response: any) => {
        console.log('Fee structures response:', response);
        if (response.success) {
          const structures = response.data || [];
          this.feeStructures.set(structures);
          
          if (structures.length === 0) {
            this.snackBar.open('No fee structures found for this student', 'Close', { duration: 3000 });
          }
        } else {
          this.snackBar.open(response.message || 'Failed to load fee structures', 'Close', { duration: 3000 });
        }
        this.loadingStructures.set(false);
      },
      error: (error) => {
        console.error('Error loading fee structures:', error);
        this.snackBar.open('Failed to load fee structures', 'Close', { duration: 3000 });
        this.loadingStructures.set(false);
      }
    });
  }

  onFeeStructureSelect(event: any): void {
    const structureId = event.value;
    if (!structureId) {
      this.resetFeeStructureSelection();
      return;
    }

    const structure = this.feeStructures().find(s => s._id === structureId);
    if (!structure) return;

    this.selectedFeeStructure.set(structure);
    this.paymentForm.patchValue({ feeStructureId: structureId });
    
    // Move to step 3 and load fee heads with payment status
    this.currentStep.set(3);
    this.loadFeeHeadsWithStatus(this.selectedStudent()?._id!, structureId);
  }

  resetFeeStructureSelection(): void {
    this.selectedFeeStructure.set(null);
    this.feeHeads.set([]);
    this.selectedFeeHeads.set(new Set());
    this.currentStep.set(2);
  }

  // STEP 3: Load fee heads with payment status
  private loadFeeHeadsWithStatus(studentId: string, structureId: string): void {
    this.loadingHeads.set(true);
    
    this.sharedService.getFeeHeadsWithPaymentStatus(studentId, structureId).subscribe({
      next: (response: any) => {
        console.log('Fee heads response:', response);
        if (response.success) {
          const heads = response.data || [];
          this.feeHeads.set(heads);
          
          // Calculate fine amount based on due date
          const structure = this.selectedFeeStructure();
          if (structure) {
            this.calculateFineAmount(structure);
          }
          
          // Check if all are paid
          const allPaid = heads.length > 0 && heads.every((h: FeeHead) => h.isPaid);
          if (allPaid) {
            this.snackBar.open('All fee heads have been paid for this structure', 'Close', { duration: 4000 });
          }
        } else {
          this.snackBar.open(response.message || 'Failed to load fee heads', 'Close', { duration: 3000 });
        }
        this.loadingHeads.set(false);
      },
      error: (error) => {
        console.error('Error loading fee heads:', error);
        this.snackBar.open('Failed to load fee heads', 'Close', { duration: 3000 });
        this.loadingHeads.set(false);
      }
    });
  }

  calculateFineAmount(feeStructure: any): void {
    // Reset fine
    this.fineAmount.set(0);
    this.daysDelayed.set(0);
    this.finePerDay.set(0);
    this.dueDate.set(null);
    
    if (!feeStructure || !feeStructure.dueDates || feeStructure.dueDates.length === 0) {
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find the first unpaid installment that is overdue
    const overdueDueDate = feeStructure.dueDates.find((dd: any) => {
      const dueDate = new Date(dd.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today; // Overdue
    });
    
    if (!overdueDueDate) {
      console.log('No overdue installments found');
      return;
    }
    
    const dueDate = new Date(overdueDueDate.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    // Calculate days delayed
    const timeDiff = today.getTime() - dueDate.getTime();
    const daysDelayed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDelayed <= 0) {
      return;
    }
    
    const finePerDay = overdueDueDate.finePerDay || 0;
    const fineAmount = daysDelayed * finePerDay;
    
    this.daysDelayed.set(daysDelayed);
    this.finePerDay.set(finePerDay);
    this.fineAmount.set(fineAmount);
    this.dueDate.set(dueDate);
    
    console.log(`Fine calculated: ${daysDelayed} days × ₹${finePerDay} = ₹${fineAmount}`);
    
    if (fineAmount > 0) {
      this.snackBar.open(
        `Late payment fine: ₹${fineAmount} (${daysDelayed} days overdue)`, 
        'Close', 
        { duration: 5000 }
      );
    }
  }

  // Fee head selection
  toggleFeeHead(feeHead: FeeHead): void {
    if (feeHead.isPaid) {
      this.snackBar.open('This fee head is already paid', 'Close', { duration: 2000 });
      return;
    }

    const selected = new Set(this.selectedFeeHeads());
    if (selected.has(feeHead._id)) {
      selected.delete(feeHead._id);
    } else {
      selected.add(feeHead._id);
    }
    this.selectedFeeHeads.set(selected);
  }

  isFeeHeadSelected(feeHeadId: string): boolean {
    return this.selectedFeeHeads().has(feeHeadId);
  }

  selectAllUnpaid(): void {
    const unpaidIds = this.feeHeads()
      .filter(head => !head.isPaid)
      .map(head => head._id);
    this.selectedFeeHeads.set(new Set(unpaidIds));
  }

  clearSelection(): void {
    this.selectedFeeHeads.set(new Set());
  }

  // STEP 4: Submit payment
  proceedToPayment(): void {
    if (this.selectedFeeHeads().size === 0) {
      this.snackBar.open('Please select at least one fee head', 'Close', { duration: 3000 });
      return;
    }
    this.currentStep.set(4);
  }

  goBackToFeeHeads(): void {
    this.currentStep.set(3);
  }

  async submitPayment(): Promise<void> {
    if (this.paymentForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    if (this.selectedFeeHeads().size === 0) {
      this.snackBar.open('Please select at least one fee head', 'Close', { duration: 3000 });
      return;
    }

    // Validate that none of the selected fee heads are already paid
    const selectedHeadIds = Array.from(this.selectedFeeHeads());
    const paidHeads = this.feeHeads().filter(h => h.isPaid && selectedHeadIds.includes(h._id));
    
    if (paidHeads.length > 0) {
      const paidNames = paidHeads.map(h => h.name).join(', ');
      this.snackBar.open(`Cannot pay already paid fee heads: ${paidNames}`, 'Close', { duration: 5000 });
      return;
    }

    const paymentMode = this.paymentForm.value.paymentMode;

    // If online payment, initiate Razorpay
    if (paymentMode === 'online') {
      this.initiateRazorpayPayment();
      return;
    }

    // For cash payment, proceed directly
    this.submitting.set(true);

    const studentId = this.selectedStudent()?._id;
    const structureId = this.selectedFeeStructure()?._id;

    const paymentData = {
      studentId,
      feeStructureId: structureId,
      feeHeads: selectedHeadIds.map(headId => {
        const head = this.feeHeads().find(h => h._id === headId);
        return {
          headId,
          amount: head?.totalAmount || head?.amount || 0
        };
      }),
      totalAmount: this.totalAmount(),
      fineAmount: this.fineAmount(),
      daysDelayed: this.daysDelayed(),
      finePerDay: this.finePerDay(),
      totalAmountWithFine: this.totalAmountWithFine(),
      paymentMode: this.paymentForm.value.paymentMode,
      paymentReference: this.paymentForm.value.paymentReference || '',
      transactionId: this.paymentForm.value.transactionId || '',
      bankName: this.paymentForm.value.bankName || '',
      chequeNumber: this.paymentForm.value.chequeNumber || '',
      chequeDate: this.paymentForm.value.chequeDate || null,
      remarks: this.paymentForm.value.remarks || '',
      paymentDate: new Date().toISOString()
    };

    console.log('Submitting payment with fine:', paymentData);

    this.sharedService.collectFee(paymentData).subscribe({
      next: (response: any) => {
        console.log('Payment response:', response);
        if (response.success) {
          // Store payment ID for PDF download
          this.lastPaymentId = response.data.paymentId || response.data.payment?._id;
          
          this.snackBar.open(
            `Payment collected successfully! Receipt: ${response.data.receiptNumber}`, 
            'Download PDF', 
            { duration: 10000 }
          ).onAction().subscribe(() => {
            this.downloadReceipt();
          });
          
          // Reload fee heads to show updated payment status
          this.loadFeeHeadsWithStatus(studentId!, structureId!);
          // Reset selections
          this.selectedFeeHeads.set(new Set());
          this.currentStep.set(3);
          this.paymentForm.patchValue({ remarks: '', paymentReference: '', transactionId: '' });
        } else {
          this.snackBar.open(response.message || 'Failed to collect payment', 'Close', { duration: 3000 });
        }
        this.submitting.set(false);
      },
      error: (error) => {
        console.error('Error collecting payment:', error);
        this.snackBar.open(error.message || 'Failed to collect payment', 'Close', { duration: 3000 });
        this.submitting.set(false);
      }
    });
  }

  // Helper methods
  getStudentDisplayName(student: Student): string {
    if (student.name) return student.name;
    if (student.firstName && student.lastName) return `${student.firstName} ${student.lastName}`;
    return student.studentId;
  }

  getStudentDetails(student: Student): string {
    const parts = [];
    if (student.studentId) parts.push(student.studentId);
    if (student.programName || student.program) parts.push(student.programName || student.program);
    if (student.year) parts.push(`Year ${student.year}`);
    if (student.semester) parts.push(`Sem ${student.semester}`);
    return parts.join(' • ');
  }

  getPaidFeeHeads(): FeeHead[] {
    return this.feeHeads().filter(h => h.isPaid);
  }

  getUnpaidFeeHeads(): FeeHead[] {
    return this.feeHeads().filter(h => !h.isPaid);
  }

  resetForm(): void {
    this.paymentForm.reset({ paymentMode: 'cash' });
    this.selectedStudent.set(null);
    this.selectedFeeStructure.set(null);
    this.feeStructures.set([]);
    this.feeHeads.set([]);
    this.selectedFeeHeads.set(new Set());
    this.currentStep.set(1);
    this.studentSearchControl.setValue('');
  }

  navigateToDashboard(): void {
    this.router.navigate(['/fees/dashboard']);
  }

  downloadReceipt(): void {
    if (!this.lastPaymentId) {
      this.snackBar.open('No payment to download', 'Close', { duration: 3000 });
      return;
    }

    this.sharedService.getReceiptData(this.lastPaymentId).subscribe({
      next: (response: any) => {
        if (response.success) {
          const receiptData = response.data;
          this.generatePDF(receiptData);
        } else {
          this.snackBar.open('Failed to fetch receipt data', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error fetching receipt:', error);
        this.snackBar.open('Failed to download receipt', 'Close', { duration: 3000 });
      }
    });
  }

  generatePDF(receiptData: any): void {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${receiptData.receiptNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px;
            background: white;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #667eea; 
            padding-bottom: 20px; 
          }
          .header h1 { 
            color: #667eea; 
            margin: 0 0 10px 0;
            font-size: 32px;
          }
          .header h2 {
            color: #555;
            margin: 0;
            font-size: 24px;
            font-weight: normal;
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 30px; 
            margin: 30px 0; 
          }
          .info-section h3 { 
            color: #667eea;
            margin: 0 0 15px 0;
            font-size: 18px;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 8px;
          }
          .info-row { 
            margin: 10px 0;
            font-size: 14px;
          }
          .label { 
            font-weight: bold; 
            display: inline-block; 
            width: 140px;
            color: #555;
          }
          .value {
            color: #000;
          }
          h3.section-title {
            color: #667eea;
            margin: 30px 0 15px 0;
            font-size: 20px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          th, td { 
            padding: 14px; 
            text-align: left; 
            border-bottom: 1px solid #e0e0e0; 
          }
          th { 
            background-color: #667eea; 
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 13px;
            letter-spacing: 0.5px;
          }
          tr:hover {
            background-color: #f5f5f5;
          }
          .total-row { 
            font-weight: bold; 
            background-color: #e3f2fd !important;
            font-size: 16px;
          }
          .total-row td {
            padding: 16px 14px;
            color: #1565c0;
          }
          .footer { 
            margin-top: 50px; 
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            text-align: center; 
            color: #666; 
            font-size: 12px;
            line-height: 1.6;
          }
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
          }
          .print-button:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
          }
          @media print {
            .print-button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <button class="print-button" onclick="window.print()">🖨️ Print Receipt</button>
        
        <div class="header">
          <h1>MGDC Medical College</h1>
          <h2>Fee Payment Receipt</h2>
        </div>
        
        <div class="info-grid">
          <div class="info-section">
            <h3>Receipt Details</h3>
            <div class="info-row">
              <span class="label">Receipt No:</span>
              <span class="value">${receiptData.receiptNumber}</span>
            </div>
            <div class="info-row">
              <span class="label">Bill No:</span>
              <span class="value">${receiptData.billNumber}</span>
            </div>
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">${new Date(receiptData.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          
          <div class="info-section">
            <h3>Student Details</h3>
            <div class="info-row">
              <span class="label">Name:</span>
              <span class="value">${receiptData.student.name}</span>
            </div>
            <div class="info-row">
              <span class="label">Student ID:</span>
              <span class="value">${receiptData.student.studentId}</span>
            </div>
            <div class="info-row">
              <span class="label">Program:</span>
              <span class="value">${receiptData.student.program} - Year ${receiptData.student.year}</span>
            </div>
          </div>
        </div>
        
        <h3 class="section-title">Fee Details</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 80px;">S.No</th>
              <th>Fee Head</th>
              <th style="width: 150px; text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${receiptData.feeHeads.map((head: any, index: number) => `
              <tr>
                <td>${index + 1}</td>
                <td>${head.name}</td>
                <td style="text-align: right; font-weight: 600;">₹${head.totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2" style="text-align: right;">Total Amount Paid:</td>
              <td style="text-align: right; font-size: 18px;">₹${receiptData.total.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="info-section" style="margin-top: 30px;">
          <h3>Payment Information</h3>
          <div class="info-row">
            <span class="label">Payment Mode:</span>
            <span class="value">${receiptData.payment.mode.toUpperCase().replace('_', ' ')}</span>
          </div>
          <div class="info-row">
            <span class="label">Reference:</span>
            <span class="value">${receiptData.payment.reference}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="value" style="color: #2e7d32; font-weight: 600;">${receiptData.payment.status.toUpperCase()}</span>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>This is a computer-generated receipt and does not require a signature.</strong></p>
          <p>For any queries, please contact the accounts department.</p>
          <p>MGDC Medical College | Phone: +91-413-XXXXXXX | Email: accounts@mgdcmedical.edu.in</p>
        </div>
      </body>
      </html>
    `;

    // Open in new tab instead of print dialog
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    } else {
      this.snackBar.open('Please allow popups to view the receipt', 'Close', { duration: 3000 });
    }
  }

  /**
   * Initiate Razorpay payment for online payment mode
   */
  initiateRazorpayPayment(): void {
    const totalAmount = this.totalAmount(); // Use computed signal
    
    if (totalAmount <= 0) {
      this.snackBar.open('Invalid payment amount', 'Close', { duration: 3000 });
      return;
    }

    this.submitting.set(true);

    // Create Razorpay order via backend
    const orderData = {
      amount: totalAmount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        studentId: this.selectedStudent()?._id,
        studentName: this.selectedStudent()?.name,
        feeStructureId: this.selectedFeeStructure()?._id
      }
    };

    this.sharedService.createRazorpayOrder(orderData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.razorpayOrderId = response.data.id;
          this.openRazorpayCheckout(response.data, totalAmount);
        } else {
          this.submitting.set(false);
          this.snackBar.open('Failed to create payment order', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error creating Razorpay order:', error);
        this.submitting.set(false);
        this.snackBar.open('Failed to initiate payment. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Open Razorpay checkout modal
   */
  openRazorpayCheckout(order: any, amount: number): void {
    const options = {
      key: 'rzp_test_s6scZHD3xkq6Mk',
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'MGDC Medical College',
      description: 'Fee Payment',
      order_id: order.id,
      image: '/assets/logo.png', // Optional: Add college logo
      handler: (response: any) => {
        // Payment successful
        this.handleRazorpaySuccess(response);
      },
      prefill: {
        name: this.selectedStudent()?.name || '',
        email: this.selectedStudent()?.email || '',
        contact: this.selectedStudent()?.contactNumber || ''
      },
      theme: {
        color: '#667eea'
      },
      modal: {
        ondismiss: () => {
          // User closed the payment modal
          this.submitting.set(false);
          this.snackBar.open('Payment cancelled', 'Close', { duration: 3000 });
        }
      }
    };

    // Check if Razorpay is loaded
    if (typeof (window as any).Razorpay === 'undefined') {
      this.submitting.set(false);
      this.snackBar.open('Payment gateway not loaded. Please refresh the page.', 'Close', { duration: 3000 });
      return;
    }

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  }

  /**
   * Handle successful Razorpay payment
   */
  handleRazorpaySuccess(razorpayResponse: any): void {
    this.razorpayPaymentId = razorpayResponse.razorpay_payment_id;

    // Verify payment on backend
    const verificationData = {
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature
    };

    this.sharedService.verifyRazorpayPayment(verificationData).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Payment verified, now submit the fee collection
          this.completePaymentSubmission(razorpayResponse.razorpay_payment_id);
        } else {
          this.submitting.set(false);
          this.snackBar.open('Payment verification failed', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error verifying payment:', error);
        this.submitting.set(false);
        this.snackBar.open('Payment verification failed. Please contact support.', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Complete payment submission after Razorpay success
   */
  completePaymentSubmission(razorpayPaymentId: string): void {
    const selectedHeadIds = Array.from(this.selectedFeeHeads());
    const totalAmount = this.totalAmount(); // Use computed signal

    const feeHeadsData = this.feeHeads()
      .filter(head => selectedHeadIds.includes(head._id))
      .map(head => ({
        headId: head._id,  // Changed from feeHeadId to headId to match backend expectation
        amount: head.totalAmount || head.amount || 0
      }));

    const paymentData = {
      studentId: this.selectedStudent()?._id,
      feeStructureId: this.selectedFeeStructure()?._id,
      feeHeads: feeHeadsData,
      totalAmount: totalAmount,
      paymentMode: 'online',
      paymentReference: razorpayPaymentId,
      transactionId: this.razorpayOrderId || '',
      bankName: 'Razorpay',
      chequeNumber: '',
      chequeDate: null,
      remarks: this.paymentForm.value.remarks || '',
      paymentDate: new Date().toISOString()
    };

    this.sharedService.collectFee(paymentData).subscribe({
      next: (response: any) => {
        this.submitting.set(false);
        
        if (response.success) {
          // Store payment ID for receipt download (handle different response structures)
          this.lastPaymentId = response.data?._id || response.data?.paymentId || response.data?.payment?._id;
          
          const receiptNumber = response.data?.receiptNumber || response.receiptNumber || 'N/A';
          
          // Show success message with download option (same as cash payment)
          this.snackBar.open(
            `Payment collected successfully! Receipt: ${receiptNumber}`, 
            'Download PDF', 
            { duration: 10000 }
          ).onAction().subscribe(() => {
            this.downloadReceipt();
          });

          // Reload fee heads to reflect payment
          this.loadFeeHeadsWithStatus(this.selectedStudent()?._id!, this.selectedFeeStructure()!._id);
          
          // Clear selections and reset form
          this.selectedFeeHeads.set(new Set());
          this.paymentForm.reset({ paymentMode: 'cash' });
          this.currentStep.set(3);
        } else {
          this.snackBar.open(response.message || 'Payment failed', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        this.submitting.set(false);
        console.error('Error submitting payment:', error);
        
        let errorMessage = 'Failed to record payment. Please contact support with payment ID: ' + razorpayPaymentId;
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }
}
