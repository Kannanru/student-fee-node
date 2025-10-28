import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { SharedService } from '../../../services/shared.service';

interface PaymentMode {
  value: string;
  label: string;
  icon: string;
  requiresDetails: boolean;
}

interface StudentBillSummary {
  student: {
    _id: string;
    name: string;
    registerNumber: string;
    class: string;
    section: string;
  };
  bill: {
    billNumber: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
  };
  installments: Array<{
    installmentNumber: number;
    dueDate: Date;
    amount: number;
    paidAmount: number;
    status: string;
  }>;
}

@Component({
  selector: 'app-pay-fees',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './pay-fees.component.html',
  styleUrl: './pay-fees.component.css'
})
export class PayFeesComponent implements OnInit {
  studentId: string = '';
  billSummary = signal<StudentBillSummary | null>(null);
  loading = signal<boolean>(true);
  processing = signal<boolean>(false);
  error = signal<string>('');
  success = signal<boolean>(false);

  paymentForm!: FormGroup;
  paymentDetailsForm!: FormGroup;

  paymentModes: PaymentMode[] = [
    { value: 'cash', label: 'Cash', icon: 'payments', requiresDetails: false },
    { value: 'card', label: 'Debit/Credit Card', icon: 'credit_card', requiresDetails: true },
    { value: 'upi', label: 'UPI', icon: 'qr_code', requiresDetails: true },
    { value: 'netbanking', label: 'Net Banking', icon: 'account_balance', requiresDetails: true },
    { value: 'cheque', label: 'Cheque', icon: 'receipt', requiresDetails: true },
    { value: 'dd', label: 'Demand Draft', icon: 'receipt_long', requiresDetails: true }
  ];

  // Safe accessors for template
  get safeStudent() {
    return this.billSummary()?.student || { name: '', registerNumber: '', class: '', section: '' };
  }

  get safeBill() {
    return this.billSummary()?.bill || { billNumber: '', totalAmount: 0, paidAmount: 0, pendingAmount: 0, overdueAmount: 0 };
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private sharedService: SharedService
  ) {
    this.createForms();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.studentId = params['id'];
      if (this.studentId) {
        this.loadBillSummary();
      }
    });

    // Watch for payment mode changes
    this.paymentForm.get('paymentMode')?.valueChanges.subscribe(mode => {
      this.updatePaymentDetailsValidation(mode);
    });
  }

  createForms(): void {
    this.paymentForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
      paymentMode: ['', Validators.required],
      paymentDate: [new Date(), Validators.required],
      remarks: ['']
    });

    this.paymentDetailsForm = this.fb.group({
      transactionId: [''],
      chequeNumber: [''],
      chequeBankName: [''],
      chequeDate: [''],
      ddNumber: [''],
      ddBankName: [''],
      ddDate: [''],
      cardLast4: [''],
      cardType: [''],
      upiId: [''],
      bankName: ['']
    });
  }

  updatePaymentDetailsValidation(mode: string): void {
    // Clear all validators first
    Object.keys(this.paymentDetailsForm.controls).forEach(key => {
      this.paymentDetailsForm.get(key)?.clearValidators();
      this.paymentDetailsForm.get(key)?.updateValueAndValidity();
    });

    // Add required validators based on mode
    if (mode === 'cheque') {
      this.paymentDetailsForm.get('chequeNumber')?.setValidators(Validators.required);
      this.paymentDetailsForm.get('chequeBankName')?.setValidators(Validators.required);
      this.paymentDetailsForm.get('chequeDate')?.setValidators(Validators.required);
    } else if (mode === 'dd') {
      this.paymentDetailsForm.get('ddNumber')?.setValidators(Validators.required);
      this.paymentDetailsForm.get('ddBankName')?.setValidators(Validators.required);
      this.paymentDetailsForm.get('ddDate')?.setValidators(Validators.required);
    } else if (mode === 'card') {
      this.paymentDetailsForm.get('cardLast4')?.setValidators([Validators.required, Validators.pattern(/^\d{4}$/)]);
      this.paymentDetailsForm.get('cardType')?.setValidators(Validators.required);
      this.paymentDetailsForm.get('transactionId')?.setValidators(Validators.required);
    } else if (mode === 'upi') {
      this.paymentDetailsForm.get('upiId')?.setValidators(Validators.required);
      this.paymentDetailsForm.get('transactionId')?.setValidators(Validators.required);
    } else if (mode === 'netbanking') {
      this.paymentDetailsForm.get('bankName')?.setValidators(Validators.required);
      this.paymentDetailsForm.get('transactionId')?.setValidators(Validators.required);
    }

    // Update validation status
    Object.keys(this.paymentDetailsForm.controls).forEach(key => {
      this.paymentDetailsForm.get(key)?.updateValueAndValidity();
    });
  }

  loadBillSummary(): void {
    this.loading.set(true);
    this.error.set('');

    this.sharedService.getStudentBill(this.studentId).subscribe({
      next: (data) => {
        this.billSummary.set(data);
        // Set default amount to pending amount
        this.paymentForm.patchValue({
          amount: data.bill.pendingAmount
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading bill summary:', err);
        this.error.set('Failed to load student fee details. Please try again.');
        this.loading.set(false);
      }
    });
  }

  setFullAmount(): void {
    const pending = this.billSummary()?.bill.pendingAmount || 0;
    this.paymentForm.patchValue({ amount: pending });
  }

  setInstallmentAmount(installment: any): void {
    const pending = installment.amount - installment.paidAmount;
    this.paymentForm.patchValue({ amount: pending });
  }

  submitPayment(): void {
    if (this.paymentForm.invalid) {
      Object.keys(this.paymentForm.controls).forEach(key => {
        this.paymentForm.get(key)?.markAsTouched();
      });
      return;
    }

    const selectedMode = this.paymentForm.value.paymentMode;
    const modeConfig = this.paymentModes.find(m => m.value === selectedMode);

    if (modeConfig?.requiresDetails && this.paymentDetailsForm.invalid) {
      Object.keys(this.paymentDetailsForm.controls).forEach(key => {
        this.paymentDetailsForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.processing.set(true);
    this.error.set('');

    const paymentData = {
      studentId: this.studentId,
      amount: this.paymentForm.value.amount,
      paymentMode: this.paymentForm.value.paymentMode,
      paymentDate: this.paymentForm.value.paymentDate,
      remarks: this.paymentForm.value.remarks,
      paymentDetails: this.paymentDetailsForm.value
    };

    this.sharedService.processPayment(paymentData).subscribe({
      next: (response) => {
        this.success.set(true);
        this.processing.set(false);
        
        // Show success message and redirect after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/fees/student-fee-view', this.studentId]);
        }, 2000);
      },
      error: (err) => {
        console.error('Error processing payment:', err);
        this.error.set(err.error?.message || 'Failed to process payment. Please try again.');
        this.processing.set(false);
      }
    });
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN');
  }

  cancel(): void {
    this.router.navigate(['/fees/student-fee-view', this.studentId]);
  }

  getSelectedModeIcon(): string {
    const mode = this.paymentForm.value.paymentMode;
    return this.paymentModes.find(m => m.value === mode)?.icon || 'payment';
  }

  requiresPaymentDetails(): boolean {
    const mode = this.paymentForm.value.paymentMode;
    return this.paymentModes.find(m => m.value === mode)?.requiresDetails || false;
  }
}
