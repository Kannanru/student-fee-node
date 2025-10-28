import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedService } from '../../../services/shared.service';

interface FeeHead {
  _id: string;
  name: string;
  code: string;
  category: string;
  defaultAmount: number;
  taxability: boolean;
  taxPercentage: number;
}

interface Quota {
  _id: string;
  code: string;
  name: string;
  displayName: string;
  requiresUSDTracking: boolean;
  defaultCurrency: string;
  metadata?: {
    color?: string;
    icon?: string;
  };
}

@Component({
  selector: 'app-fee-structure-form',
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
    MatCheckboxModule,
    MatStepperModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './fee-structure-form.component.html',
  styleUrl: './fee-structure-form.component.css'
})
export class FeeStructureFormComponent implements OnInit {
  feeStructureForm!: FormGroup;
  isEditMode = false;
  structureId: string = '';
  
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  error = signal<string>('');
  
  feeHeads = signal<FeeHead[]>([]);
  quotas = signal<Quota[]>([]);
  
  // Computed signal for selected quota
  selectedQuota = computed(() => {
    const quotaCode = this.feeStructureForm?.get('quotaSelection.quota')?.value;
    return this.quotas().find(q => q.code === quotaCode);
  });
  
  programs = [
    { value: 'MBBS', label: 'MBBS - Bachelor of Medicine and Bachelor of Surgery' },
    { value: 'BDS', label: 'BDS - Bachelor of Dental Surgery' },
    { value: 'BAMS', label: 'BAMS - Bachelor of Ayurvedic Medicine and Surgery' },
    { value: 'BHMS', label: 'BHMS - Bachelor of Homeopathic Medicine and Surgery' },
    { value: 'B.Pharm', label: 'B.Pharm - Bachelor of Pharmacy' },
    { value: 'BSc-Nursing', label: 'BSc Nursing' },
    { value: 'MD', label: 'MD - Doctor of Medicine' },
    { value: 'MS', label: 'MS - Master of Surgery' },
    { value: 'MDS', label: 'MDS - Master of Dental Surgery' }
  ];
  
  departments = [
    'General Medicine',
    'General Surgery',
    'Pediatrics',
    'Obstetrics & Gynecology',
    'Orthopedics',
    'Anesthesiology',
    'Radiology',
    'Pathology',
    'Dermatology',
    'Psychiatry',
    'ENT',
    'Ophthalmology',
    'Community Medicine',
    'Anatomy',
    'Physiology',
    'Biochemistry',
    'Pharmacology',
    'Microbiology',
    'Forensic Medicine'
  ];
  
  years = [1, 2, 3, 4, 5];
  semesters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  academicYears = this.generateAcademicYears();
  
  displayedColumns: string[] = ['feeHead', 'category', 'amount', 'usd', 'tax', 'total', 'actions'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadFeeHeads();
    this.loadQuotas();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.structureId = params['id'];
        this.loadFeeStructure(this.structureId);
      }
    });
    
    // Watch quota changes to handle USD field visibility
    this.quotaSelectionGroup.get('quota')?.valueChanges.subscribe(quotaCode => {
      this.onQuotaChange(quotaCode);
    });
  }

  createForm(): void {
    this.feeStructureForm = this.fb.group({
      // Step 1: Basic Information
      basicInfo: this.fb.group({
        code: ['', Validators.required],
        name: ['', Validators.required],
        description: ['']
      }),
      
      // Step 2: Academic Details
      academicDetails: this.fb.group({
        program: ['', Validators.required],
        department: ['', Validators.required],
        year: ['', Validators.required],
        semester: ['', Validators.required],
        academicYear: ['', Validators.required],
        effectiveFrom: [this.formatDateForInput(new Date()), Validators.required],
        mode: ['full', Validators.required]
      }),
      
      // Step 3: Quota
      quotaSelection: this.fb.group({
        quota: ['', Validators.required]
      }),
      
      // Step 4: Fee Heads
      heads: this.fb.array([]),
      
      // Step 5: Installment Configuration
      dueDates: this.fb.array([]),
      
      // Status
      isActive: [true]
    });
    
    // Watch mode changes to update installments
    this.academicDetailsGroup.get('mode')?.valueChanges.subscribe(mode => {
      this.updateInstallments(mode);
    });
    
    // Initialize installments for default mode
    this.updateInstallments('full');
  }

  get basicInfoGroup(): FormGroup {
    return this.feeStructureForm.get('basicInfo') as FormGroup;
  }

  get academicDetailsGroup(): FormGroup {
    return this.feeStructureForm.get('academicDetails') as FormGroup;
  }

  get quotaSelectionGroup(): FormGroup {
    return this.feeStructureForm.get('quotaSelection') as FormGroup;
  }

  get headsArray(): FormArray {
    return this.feeStructureForm.get('heads') as FormArray;
  }

  get dueDatesArray(): FormArray {
    return this.feeStructureForm.get('dueDates') as FormArray;
  }

  updateInstallments(mode: string): void {
    const dueDatesArray = this.dueDatesArray;
    dueDatesArray.clear();
    
    const installmentCount = mode === 'full' ? 1 : parseInt(mode);
    const today = new Date();
    
    for (let i = 0; i < installmentCount; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + (i * 2)); // 2 months apart
      
      dueDatesArray.push(this.fb.group({
        installmentNumber: [i + 1],
        dueDate: [this.formatDateForInput(dueDate), Validators.required],
        amount: [0, [Validators.required, Validators.min(0)]],
        amountUSD: [0],
        finePerDay: [0, [Validators.min(0)]],
        description: [`${mode === 'full' ? 'Full Payment' : `Installment ${i + 1}`}`]
      }));
    }
  }

  loadFeeHeads(): void {
    this.loading.set(true);
    this.sharedService.getActiveFeeHeads().subscribe({
      next: (data: FeeHead[]) => {
        this.feeHeads.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading fee heads:', err);
        this.error.set('Failed to load fee heads');
        this.loading.set(false);
      }
    });
  }

  loadQuotas(): void {
    this.sharedService.getActiveQuotas().subscribe({
      next: (data: Quota[]) => {
        this.quotas.set(data);
      },
      error: (err: any) => {
        console.error('Error loading quotas:', err);
      }
    });
  }

  loadFeeStructure(id: string): void {
    this.loading.set(true);
    this.sharedService.getFeeStructure(id).subscribe({
      next: (data: any) => {
        this.populateForm(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading fee structure:', err);
        this.error.set('Failed to load fee structure');
        this.loading.set(false);
      }
    });
  }

  populateForm(data: any): void {
    this.basicInfoGroup.patchValue({
      code: data.code,
      name: data.name,
      description: data.description
    });
    
    this.academicDetailsGroup.patchValue({
      program: data.program,
      department: data.department,
      year: data.year,
      semester: data.semester,
      academicYear: data.academicYear,
      effectiveFrom: data.effectiveFrom ? this.formatDateForInput(new Date(data.effectiveFrom)) : this.formatDateForInput(new Date()),
      mode: data.mode || 'full'
    });
    
    this.quotaSelectionGroup.patchValue({
      quota: data.quota
    });
    
    this.feeStructureForm.patchValue({
      isActive: data.isActive !== false
    });
    
    // Populate fee heads
    this.headsArray.clear();
    data.heads?.forEach((head: any) => {
      this.headsArray.push(this.fb.group({
        headId: [head.headId._id || head.headId],
        headName: [head.headId.name || head.headName],
        amount: [head.amount, [Validators.required, Validators.min(0)]],
        amountUSD: [head.amountUSD || 0, Validators.min(0)],
        taxPercentage: [head.taxPercentage || 0, [Validators.min(0), Validators.max(100)]],
        taxAmount: [head.taxAmount || 0]
      }));
    });
  }

  addFeeHead(feeHead: FeeHead): void {
    // Check if already added
    const exists = this.headsArray.controls.some(
      control => control.get('headId')?.value === feeHead._id
    );
    
    if (exists) {
      alert('This fee head is already added');
      return;
    }
    
    const taxAmount = feeHead.taxability 
      ? (feeHead.defaultAmount * feeHead.taxPercentage / 100) 
      : 0;
    
    this.headsArray.push(this.fb.group({
      headId: [feeHead._id],
      headName: [feeHead.name],
      amount: [feeHead.defaultAmount, [Validators.required, Validators.min(0)]],
      amountUSD: [0, Validators.min(0)],
      taxPercentage: [feeHead.taxPercentage, [Validators.min(0), Validators.max(100)]],
      taxAmount: [taxAmount]
    }));
    
    this.calculateTotals();
  }

  removeFeeHead(index: number): void {
    this.headsArray.removeAt(index);
    this.calculateTotals();
  }

  onAmountChange(index: number): void {
    const headControl = this.headsArray.at(index);
    const amount = headControl.get('amount')?.value || 0;
    const taxPercentage = headControl.get('taxPercentage')?.value || 0;
    const taxAmount = (amount * taxPercentage / 100);
    
    headControl.patchValue({ taxAmount });
    this.calculateTotals();
  }

  onQuotaChange(quotaCode: string): void {
    const selectedQuota = this.quotas().find(q => q.code === quotaCode);
    
    // Update USD requirement for all fee heads
    this.headsArray.controls.forEach(control => {
      const amountUSDControl = control.get('amountUSD');
      if (selectedQuota?.requiresUSDTracking) {
        amountUSDControl?.setValidators([Validators.required, Validators.min(0)]);
      } else {
        amountUSDControl?.clearValidators();
        amountUSDControl?.setValue(0);
      }
      amountUSDControl?.updateValueAndValidity();
    });
  }

  generateCode(): void {
    const program = this.academicDetailsGroup.get('program')?.value;
    const year = this.academicDetailsGroup.get('year')?.value;
    const semester = this.academicDetailsGroup.get('semester')?.value;
    const quota = this.quotaSelectionGroup.get('quota')?.value;
    
    if (program && year && semester && quota) {
      const quotaCode = quota.toUpperCase().split('-').map((s: string) => s[0]).join('');
      const code = `${program}-Y${year}-S${semester}-${quotaCode}-V1`;
      this.basicInfoGroup.patchValue({ code });
      
      // Show hint about versioning
      const currentCode = this.basicInfoGroup.get('code')?.value;
      console.log('Generated code:', code, '(You can modify the version number if V1 exists)');
    }
  }

  generateName(): void {
    const program = this.academicDetailsGroup.get('program')?.value;
    const year = this.academicDetailsGroup.get('year')?.value;
    const semester = this.academicDetailsGroup.get('semester')?.value;
    const academicYear = this.academicDetailsGroup.get('academicYear')?.value;
    const quota = this.quotas().find(q => q.code === this.quotaSelectionGroup.get('quota')?.value);
    
    if (program && year && semester && academicYear && quota) {
      const name = `${program} Year ${year} Semester ${semester} - ${quota.displayName} - ${academicYear}`;
      this.basicInfoGroup.patchValue({ name });
    }
  }

  calculateTotals(): { totalINR: number; totalUSD: number; totalTax: number; grandTotal: number } {
    let totalINR = 0;
    let totalUSD = 0;
    let totalTax = 0;
    
    this.headsArray.controls.forEach(control => {
      const amount = control.get('amount')?.value || 0;
      const amountUSD = control.get('amountUSD')?.value || 0;
      const taxAmount = control.get('taxAmount')?.value || 0;
      
      totalINR += amount;
      totalUSD += amountUSD;
      totalTax += taxAmount;
    });
    
    const grandTotal = totalINR + totalTax;
    
    return { totalINR, totalUSD, totalTax, grandTotal };
  }

  getTotalWithTax(index: number): number {
    const headControl = this.headsArray.at(index);
    const amount = headControl.get('amount')?.value || 0;
    const taxAmount = headControl.get('taxAmount')?.value || 0;
    return amount + taxAmount;
  }

  isNRIQuota(): boolean {
    const quotaCode = this.quotaSelectionGroup.get('quota')?.value;
    return quotaCode === 'nri';
  }

  saveFeeStructure(): void {
    if (this.feeStructureForm.invalid) {
      // Mark all nested groups as touched
      this.basicInfoGroup.markAllAsTouched();
      this.academicDetailsGroup.markAllAsTouched();
      this.quotaSelectionGroup.markAllAsTouched();
      this.headsArray.markAllAsTouched();
      this.dueDatesArray.markAllAsTouched();
      return;
    }
    
    if (this.headsArray.length === 0) {
      alert('Please add at least one fee head');
      return;
    }
    
    this.saving.set(true);
    this.error.set('');
    
    // Calculate totals
    const totals = this.calculateTotals();
    
    // Flatten the nested structure for API
    const formData = {
      ...this.basicInfoGroup.value,
      ...this.academicDetailsGroup.value,
      ...this.quotaSelectionGroup.value,
      heads: this.headsArray.value,
      dueDates: this.dueDatesArray.value,
      totalAmount: totals.grandTotal,
      totalAmountUSD: totals.totalUSD,
      isActive: this.feeStructureForm.get('isActive')?.value,
      version: 1
    };
    
    const apiCall = this.isEditMode
      ? this.sharedService.updateFeeStructure(this.structureId, formData)
      : this.sharedService.createFeeStructure(formData);
    
    apiCall.subscribe({
      next: () => {
        this.saving.set(false);
        alert(`Fee structure ${this.isEditMode ? 'updated' : 'created'} successfully!`);
        this.router.navigate(['/fees/structures']);
      },
      error: (err: any) => {
        console.error('Error saving fee structure:', err);
        
        // Handle duplicate key error
        if (err.error?.error?.includes('E11000') && err.error?.error?.includes('code_1')) {
          const codeMatch = err.error.error.match(/dup key: \{ code: "([^"]+)" \}/);
          const duplicateCode = codeMatch ? codeMatch[1] : this.basicInfoGroup.get('code')?.value;
          
          // Extract version and suggest next one
          const versionMatch = duplicateCode.match(/-V(\d+)$/);
          const currentVersion = versionMatch ? parseInt(versionMatch[1]) : 1;
          const nextVersion = currentVersion + 1;
          const suggestedCode = duplicateCode.replace(/-V\d+$/, `-V${nextVersion}`);
          
          this.error.set(
            `A fee structure with code "${duplicateCode}" already exists. ` +
            `Please modify the code (suggested: "${suggestedCode}") or delete the existing structure first.`
          );
          
          // Scroll to top to show error
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          this.error.set(err.error?.message || err.error?.error || 'Failed to save fee structure');
        }
        
        this.saving.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/fees/structures']);
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

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatUSD(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getFeeHeadName(headId: string): string {
    return this.feeHeads().find(h => h._id === headId)?.name || '';
  }

  getFeeHeadCategory(headId: string): string {
    return this.feeHeads().find(h => h._id === headId)?.category || '';
  }

  getModeLabel(mode: string): string {
    const modeLabels: { [key: string]: string } = {
      'full': 'Full Payment',
      '2': '2 Installments',
      '4': '4 Installments'
    };
    return modeLabels[mode] || mode;
  }

  getQuotaLabel(quotaCode: string): string {
    const quota = this.quotas().find(q => q.code === quotaCode);
    return quota ? quota.displayName : quotaCode?.toUpperCase() || '';
  }

  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }
}
