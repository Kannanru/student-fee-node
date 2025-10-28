# Fee Module - Requirements Mapping & Gap Analysis

## 📊 Requirements Breakdown

### 1. Scope & Goals ✅

**Requirement**: Fee Management module with dashboard widgets, payment collection, fee structure, student dues search, and reporting.

**Current Status**: ⚠️ Partial
- Dashboard: ❌ Not implemented
- Payment Collection: ⚠️ Basic structure exists
- Fee Structure: ⚠️ Basic models exist
- Student Dues: ❌ Not implemented
- Reporting: ⚠️ Basic reports exist

**Gap**: Need complete dashboard, enhanced payment workflow, quota-based plans, advanced reports

---

### 2. Personas & Roles ✅

**Requirement**: Admin, Accountant, Viewer/Principal roles with specific permissions

**Current Status**: ⚠️ Partial
- Authentication: ✅ Exists (JWT-based)
- Role Management: ⚠️ Basic user roles exist
- Permission Matrix: ❌ Not implemented

**Implementation Needed**:
```typescript
// backend/middleware/rbac.js
const permissions = {
  admin: {
    'fee:view-all': true,
    'fee:create-plan': true,
    'fee:edit-plan': true,
    'fee:delete-plan': true,
    'fee:collect-payment': true,
    'fee:approve-refund': true,
    'fee:adjust-amount': true,
    'fee:view-audit': true,
    'fee:export-reports': true,
    'fee:override-transaction': true
  },
  accountant: {
    'fee:view-all': true,
    'fee:collect-payment': true,
    'fee:view-reports': true,
    'fee:export-reports': true,
    'fee:generate-receipt': true,
    'fee:request-refund': true
  },
  viewer: {
    'fee:view-dashboard': true,
    'fee:view-reports': true,
    'fee:view-student-fees': true
  }
};
```

---

### 3. Global Assumptions ✅

| Assumption | Status | Implementation |
|------------|--------|----------------|
| Academic year defaults to current (2025-26) | ❌ Not implemented | Add to context/filter service |
| Currency: INR, NRI stores USD | ❌ Not implemented | Add to FeePlan model |
| Widgets respect active filters | ❌ No widgets yet | Dashboard filter service |
| Time zone: IST | ⚠️ Server default | Configure in .env |
| Date ranges inclusive | ✅ Existing | Continue pattern |

**Action**: Create `backend/config/app-config.js` with defaults

---

### 4. Navigation Map ✅

**Requirement**: Top Bar → Fee Management Menu with Dashboard, Collect Payment, Fee Structure, Reports, Student Fees

**Current Status**: ⚠️ Partial
- Top Bar: ✅ Exists
- Fee Management Menu: ⚠️ Routes exist, empty components

**Frontend Routes Needed**:
```typescript
// frontend/src/app/app.routes.ts - Fee Section
{
  path: 'fees',
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: FeeDashboardComponent },
    { path: 'collect', component: FeeCollectionComponent },
    { path: 'structure', component: FeeStructureComponent },
    { path: 'student-fees', component: StudentFeesComponent },
    { path: 'reports', component: FeeReportsComponent },
    { path: 'reports/:type', component: ReportDetailComponent }
  ],
  canActivate: [AuthGuard]
}
```

---

### 5. Dashboard Widgets & Behavior ✅

#### 5.1 Total Collection Widget

**Requirement**: Display total amount received for selected academic year

**Current Status**: ❌ Not implemented

**Backend API**:
```javascript
GET /api/dashboard/fee-stats
Query: ?academicYear=2025-2026&department=&semester=&quota=

Response:
{
  totalCollection: {
    amount: 50000000, // INR
    amountUSD: 600000, // For NRI
    studentsCount: 1000,
    trend: +15.5 // % change from previous period
  }
}

Formula: 
SELECT SUM(amount) FROM payments 
WHERE status = 'confirmed' 
AND paymentDate >= academicYearStart 
AND paymentDate <= academicYearEnd
AND (filters applied)
```

#### 5.2 Pending Amount Widget

**Requirement**: Sum of outstanding dues for all active students

**Current Status**: ❌ Not implemented

**Backend Logic**:
```javascript
Response:
{
  pendingAmount: {
    amount: 15000000,
    studentsCount: 300,
    overdueAmount: 5000000,
    overdueCount: 100
  }
}

Formula:
SELECT SUM(balanceAmount) FROM student_bills
WHERE status IN ('pending', 'partially-paid', 'overdue')
AND studentId IN (SELECT id FROM students WHERE status = 'active')
```

#### 5.3 Student Status Widget

**Requirement**: Count of Paid, Pending, Overdue students

**Current Status**: ❌ Not implemented

**Backend Logic**:
```javascript
Response:
{
  studentStatus: {
    paid: 700,      // paidAmount >= totalAmount
    pending: 200,   // paidAmount < totalAmount AND dueDate >= today
    overdue: 100    // paidAmount < totalAmount AND dueDate < today
  }
}
```

#### 5.4 Average Payment Widget

**Requirement**: Average collection per active student

**Current Status**: ❌ Not implemented

**Formula**: `totalCollection / activeStudentsCount`

#### 5.5 Quick Actions

**Requirement**: 4 action buttons

**Current Status**: ❌ Not implemented

**Implementation**:
```typescript
quickActions = [
  { label: 'Collect Payment', icon: 'payment', route: '/fees/collect', color: 'primary' },
  { label: 'Fee Structure', icon: 'account_tree', route: '/fees/structure', color: 'accent' },
  { label: 'Reports', icon: 'assessment', route: '/fees/reports', color: 'warn' },
  { label: 'Student Fees', icon: 'people', route: '/fees/student-fees', color: 'primary' }
];
```

#### 5.6 Lower Panels

**Recent Payments**:
```javascript
GET /api/dashboard/recent-payments?limit=10

Response: [{
  studentName: "John Doe",
  registerNumber: "MBBS2025001",
  amount: 125000,
  mode: "UPI",
  receiptNumber: "RCP-2025-00123",
  paymentDate: "2025-10-17T10:30:00Z",
  collectedBy: "Accountant Name"
}]
```

**Fee Defaulters**:
```javascript
GET /api/dashboard/defaulters?limit=10&sortBy=daysOverdue

Response: [{
  studentName: "Jane Smith",
  registerNumber: "MBBS2025002",
  department: "Medicine",
  year: 1,
  amountDue: 75000,
  daysOverdue: 45,
  dueDate: "2025-09-01",
  contactNumber: "9876543210"
}]
```

**Collection Summary**:
```javascript
GET /api/dashboard/collection-summary?academicYear=2025-2026

Response: {
  byHead: [
    { headName: "Tuition Fee", amount: 35000000, count: 850, percentage: 70 },
    { headName: "Hostel Rent", amount: 8000000, count: 400, percentage: 16 }
  ],
  byMode: [
    { mode: "UPI", amount: 25000000, count: 1200, percentage: 50 },
    { mode: "Cash", amount: 15000000, count: 300, percentage: 30 }
  ]
}
```

---

### 6. Fee Structure Management ✅

**Requirement**: Define fee heads and plans by Department, Year, Semester, Quota

**Current Status**: ⚠️ Basic structure exists

**Missing Features**:
1. ❌ Quota-based plans
2. ❌ Version tracking
3. ❌ NRI USD amounts
4. ❌ Installment configuration
5. ❌ Bulk student assignment
6. ❌ Plan history/versions
7. ❌ 13 predefined fee heads

**Enhancement Needed**:

**FeeHead Model - Add Fields**:
```javascript
{
  // Existing: name, code, taxability, glCode, status
  
  // NEW FIELDS:
  category: 'academic'|'hostel'|'miscellaneous',
  frequency: 'one-time'|'annual'|'semester',
  isRefundable: Boolean,
  defaultAmount: Number,
  description: String,
  displayOrder: Number
}
```

**FeePlan Model - Add Fields**:
```javascript
{
  // Existing: name, program, semester, mode, heads, amounts, dueDates, status
  
  // NEW FIELDS:
  code: String (unique), // "MBBS-Y1-S1-PU-V1"
  version: Number,
  department: String,
  year: Number,
  quota: String, // 'puducherry-ut'|'all-india'|'nri'|'self-sustaining'
  academicYear: String,
  heads: [{
    headId: ObjectId,
    amount: Number,
    amountUSD: Number, // For NRI
    taxPercent: Number,
    taxAmount: Number
  }],
  totalAmount: Number,
  totalAmountUSD: Number,
  effectiveFrom: Date,
  effectiveTo: Date,
  supersededBy: ObjectId,
  locked: Boolean
}
```

---

### 7. Collect Payment Flow ✅

**Requirement**: Search Student → Display dues → Choose heads → Enter amount → Validate → Confirm → Generate receipt

**Current Status**: ❌ Not implemented (empty component)

**Implementation Steps**:

**Step 1: Student Search** (Component State: 'search')
- API: `GET /api/students/search-fees?q=&department=&year=`
- Display: Name, Photo, Register No, Department, Outstanding Amount
- Action: Select student → Load dues

**Step 2: Display Dues** (Component State: 'review')
- API: `GET /api/students/:id/outstanding-bills`
- Show: All pending bills with head-wise breakdown
- Allow: Select specific heads to collect
- Calculate: Total selected amount + penalties

**Step 3: Payment Details** (Component State: 'collect')
- Input: Amount, Payment Mode
- Mode-specific fields:
  - Cash: None
  - UPI: Transaction ID, UPI ID
  - Card: Last 4 digits, Card type
  - Bank Transfer: Account, IFSC, Date
  - DD/Cheque: Number, Date, Bank
- Validation: Amount <= Selected heads total

**Step 4: Confirmation** (Component State: 'confirm')
- Review: All details
- Action: Submit payment
- API: `POST /api/payments/collect`
- Response: Payment record + Receipt
- Auto-generate receipt PDF
- Options: Print, Download, Email

**Validations Checklist**:
```typescript
✅ Student selected
✅ At least one head selected
✅ Amount > 0
✅ Amount <= Outstanding amount
✅ Payment mode selected
✅ Mode-specific fields filled
✅ No duplicate submission (idempotency)
✅ Partial payment warning shown
✅ Overpayment confirmation required
```

**Payment Modes Configuration**:
```typescript
const paymentModes = [
  { 
    value: 'cash', 
    label: 'Cash', 
    fields: [],
    icon: 'payments'
  },
  { 
    value: 'upi', 
    label: 'UPI', 
    fields: ['transactionId', 'upiId'],
    icon: 'qr_code'
  },
  { 
    value: 'card', 
    label: 'Card (Debit/Credit)', 
    fields: ['cardLast4', 'cardType'],
    icon: 'credit_card'
  },
  { 
    value: 'bank-transfer', 
    label: 'Bank Transfer', 
    fields: ['accountNumber', 'ifsc', 'transferDate'],
    icon: 'account_balance'
  },
  { 
    value: 'dd', 
    label: 'Demand Draft', 
    fields: ['ddNumber', 'ddDate', 'bankName'],
    icon: 'description'
  },
  { 
    value: 'cheque', 
    label: 'Cheque', 
    fields: ['chequeNumber', 'chequeDate', 'bankName'],
    icon: 'note'
  }
];
```

---

### 8. Student Fees Search ✅

**Requirement**: Search by multiple criteria, view detailed breakdown

**Current Status**: ❌ Not implemented (empty component)

**Search Filters**:
```typescript
interface StudentFeeFilters {
  search: string; // Name or Register Number
  department: string;
  year: number;
  semester: number;
  quota: string;
  status: 'paid'|'pending'|'overdue'|'all';
  minAmount: number;
  maxAmount: number;
  dueDateFrom: Date;
  dueDateTo: Date;
}
```

**API**:
```javascript
GET /api/students/search-fees?q=john&department=Medicine&status=overdue&page=1&limit=20

Response: {
  students: [{
    studentId: "...",
    name: "John Doe",
    registerNumber: "MBBS2025001",
    department: "Medicine",
    year: 1,
    semester: 1,
    quota: "puducherry-ut",
    totalBilled: 150000,
    totalPaid: 75000,
    totalBalance: 75000,
    isOverdue: true,
    daysOverdue: 30,
    lastPaymentDate: "2025-09-15"
  }],
  pagination: {
    total: 150,
    page: 1,
    limit: 20,
    pages: 8
  }
}
```

**Student Detail View**:
```javascript
GET /api/students/:id/fee-details

Response: {
  student: {
    name, registerNumber, department, year, semester, quota,
    photo, contactNumber, email, guardianName, guardianPhone
  },
  bills: [{
    billNumber: "BILL-2025-00123",
    academicYear: "2025-2026",
    semester: 1,
    billedDate: "2025-08-01",
    dueDate: "2025-09-01",
    totalAmount: 150000,
    paidAmount: 75000,
    balanceAmount: 75000,
    penaltyAmount: 5000,
    status: "overdue",
    daysOverdue: 30,
    heads: [{
      headName: "Tuition Fee",
      amount: 100000,
      paid: 50000,
      balance: 50000
    }],
    payments: [{
      receiptNumber: "RCP-2025-00100",
      date: "2025-08-15",
      amount: 75000,
      mode: "UPI"
    }]
  }],
  summary: {
    totalBilled: 150000,
    totalPaid: 75000,
    totalBalance: 75000,
    paymentsCount: 1,
    lastPaymentDate: "2025-08-15"
  }
}
```

**Available Actions**:
1. Collect Payment (opens payment collection)
2. View Receipts (list all receipts)
3. Download Statement (PDF)
4. Adjust Fee (admin only - discounts/waivers)
5. Add Note (internal notes)
6. Send Reminder (email/SMS)

---

### 9. Reports ✅

**Requirement**: 8 report types with filters, pagination, export

**Current Status**: ⚠️ Basic report structure exists

**Report Implementations Needed**:

#### 9.1 Daily Collection Report
```javascript
GET /api/reports/daily-collection?date=2025-10-17&collectedBy=&mode=&department=

Columns:
- Receipt Number
- Time
- Student Name & Register No
- Department & Year
- Fee Heads
- Amount
- Mode
- Collected By

Export: CSV, XLSX, PDF
```

#### 9.2 Head-wise Collection
```javascript
GET /api/reports/head-wise-collection?startDate=&endDate=&department=

Columns:
- Fee Head Name
- Amount Collected
- Number of Payments
- Average Amount
- % of Total

Chart: Bar chart showing amount by head
Export: CSV, XLSX, PDF with chart
```

#### 9.3 Department/Year/Semester Summary
```javascript
GET /api/reports/dept-summary?academicYear=2025-2026&department=&year=&semester=

Columns:
- Department
- Year
- Semester
- Total Students
- Total Billed
- Total Collected
- Total Pending
- Collection %

Export: CSV, XLSX, PDF
```

#### 9.4 Quota-wise Summary
```javascript
GET /api/reports/quota-summary?academicYear=2025-2026

Columns:
- Quota Name
- Students Count
- Amount Billed
- Amount Collected
- Amount Pending
- Collection %

Chart: Pie chart showing distribution by quota
Export: CSV, XLSX, PDF with chart
```

#### 9.5 Defaulter List
```javascript
GET /api/reports/defaulters?minDays=7&department=&year=&maxAmount=

Columns:
- Student Name & Register No
- Department & Year
- Amount Due
- Days Overdue
- Last Payment Date
- Contact Number

Sort: By days overdue (desc) or amount (desc)
Actions: Send Reminder, Mark Follow-up
Export: CSV, XLSX, PDF
```

#### 9.6 Payment Mode Summary
```javascript
GET /api/reports/payment-mode-summary?startDate=&endDate=

Columns:
- Payment Mode
- Number of Transactions
- Total Amount
- Average Amount
- % of Total

Chart: Pie chart showing distribution by mode
Export: CSV, XLSX, PDF with chart
```

#### 9.7 Student Ledger
```javascript
GET /api/reports/student-ledger/:studentId?academicYear=

Format: Like bank statement
- Opening Balance
- All Bills (debit entries)
- All Payments (credit entries)
- All Adjustments
- Running Balance
- Closing Balance

Export: PDF only (formatted)
```

#### 9.8 Audit Trail
```javascript
GET /api/reports/audit-trail?entity=payment&startDate=&endDate=&userId=

Columns:
- Timestamp
- User
- Action (create/update/delete)
- Entity Type
- Entity ID
- Before Value
- After Value
- IP Address

Export: CSV
```

---

### 10. Widget States ✅

**Requirement**: Loading, Empty, Error states for all widgets

**Implementation**:

```typescript
interface WidgetState {
  loading: boolean;
  error: string | null;
  data: any | null;
}

// Loading State
<mat-spinner *ngIf="widget.loading"></mat-spinner>

// Empty State
<div *ngIf="!widget.loading && !widget.data" class="empty-state">
  <mat-icon>inbox</mat-icon>
  <p>No payments recorded yet</p>
  <button mat-raised-button color="primary" (click)="navigateToCollect()">
    Collect Payment
  </button>
</div>

// Error State
<div *ngIf="widget.error" class="error-state">
  <mat-icon color="warn">error</mat-icon>
  <p>{{ widget.error }}</p>
  <button mat-button (click="retry()">Retry</button>
</div>

// Data State
<div *ngIf="!widget.loading && widget.data && !widget.error">
  <!-- Widget content -->
</div>
```

---

### 11. Permissions & Audit ✅

**Requirement**: RBAC with audit logging for all critical actions

**Implementation Status**: ⚠️ Partial (basic auth exists)

**RBAC Middleware** (to create):
```javascript
// backend/middleware/rbac.js

function checkPermission(permission) {
  return (req, res, next) => {
    const userRole = req.user.role;
    const permissions = PERMISSION_MATRIX[userRole];
    
    if (!permissions || !permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
}

// Usage in routes
router.post('/collect', auth, checkPermission('fee:collect-payment'), controller.collect);
```

**Audit Logging** (to create):
```javascript
// backend/middleware/audit.js

async function auditLog(req, res, next) {
  const originalSend = res.json;
  
  res.json = function(data) {
    // Log after successful operation
    if (res.statusCode >= 200 && res.statusCode < 300) {
      AuditLog.create({
        entity: req.auditEntity,
        entityId: req.auditEntityId,
        action: req.method,
        before: req.auditBefore,
        after: data,
        userId: req.user._id,
        userName: req.user.name,
        timestamp: new Date(),
        ipAddress: req.ip,
        deviceInfo: req.get('User-Agent'),
        correlationId: req.correlationId
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
}
```

---

### 12. Performance & UX ✅

**Targets**:
- Dashboard: ≤ 2s for 10k students ✅
- Parallel widget fetch ✅
- Debounced search ✅
- Infinite scroll ✅
- Idempotent payment API ✅

**Implementation**:

```typescript
// Parallel widget fetch
const fetchDashboardData = async () => {
  const [stats, payments, defaulters, summary] = await Promise.all([
    dashboardService.getStats(),
    dashboardService.getRecentPayments(),
    dashboardService.getDefaulters(),
    dashboardService.getCollectionSummary()
  ]);
  
  return { stats, payments, defaulters, summary };
};

// Debounced search (300ms)
searchControl.valueChanges
  .pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => studentService.search(term))
  )
  .subscribe(results => this.searchResults = results);

// Idempotent payment API
async function collectPayment(req, res) {
  const { idempotencyKey } = req.body;
  
  // Check if already processed
  const existing = await Payment.findOne({ idempotencyKey });
  if (existing) {
    return res.json({ success: true, data: existing, duplicate: true });
  }
  
  // Process payment
  const payment = await Payment.create({ ...req.body, idempotencyKey });
  res.json({ success: true, data: payment });
}
```

---

## 🎯 Implementation Priority Matrix

### P0 - Critical (Must Have for MVP)
1. ✅ QuotaConfig model
2. ✅ Enhanced FeeHead model (13 predefined heads)
3. ✅ Enhanced FeePlan model (quota support)
4. ✅ StudentBill model (replaces Fee)
5. ✅ Enhanced Payment model
6. ✅ Dashboard APIs (5 widgets + 3 panels)
7. ✅ Dashboard UI
8. ✅ Payment Collection Flow (4 steps)
9. ✅ Receipt Generation (PDF)

### P1 - High (Should Have)
1. ✅ Fee Structure Management UI
2. ✅ Student Fees Search & Detail
3. ✅ 8 Reports (all types)
4. ✅ Export functionality (CSV, XLSX, PDF)
5. ✅ RBAC implementation
6. ✅ Audit logging

### P2 - Medium (Nice to Have)
1. ✅ NRI USD tracking
2. ✅ Refund management
3. ✅ Plan versioning
4. ✅ Overpayment handling
5. ✅ Email/SMS notifications

### P3 - Low (Future)
1. ⬜ GST/Tax handling
2. ⬜ Scheduled reports
3. ⬜ Mobile app
4. ⬜ Biometric payment verification

---

## ✅ Acceptance Criteria Checklist

Based on requirement #17:

```
[ ] 1. Able to configure a plan per quota and assign to student cohort
    - Create FeePlan with quota field
    - Bulk assign API
    - UI for plan creation
    
[ ] 2. Dashboard correctly reflects totals after payments
    - Real-time or 5-min cached stats
    - All widgets refresh after payment
    
[ ] 3. Partial payment results in pending balance and visible in Student Fees view
    - Bill status updates to 'partially-paid'
    - Balance calculated correctly
    - Shown in student detail
    
[ ] 4. Defaulter report matches students past due date
    - isOverdue calculation correct
    - daysOverdue computed accurately
    - Report filters work
    
[ ] 5. Receipts generated with unique numbers and printable PDFs
    - Unique receipt number (auto-increment)
    - PDF generation with all details
    - Print button functional
    
[ ] 6. Exports available for all key reports
    - CSV export for all reports
    - XLSX export (optional)
    - PDF export with formatting
```

---

## 📊 Current vs Required - Summary Table

| Feature | Current | Required | Gap | Priority |
|---------|---------|----------|-----|----------|
| Fee Heads | 0 | 13 | 13 | P0 |
| Quota Types | 0 | 4 | 4 | P0 |
| Fee Plans | Basic | Quota-based | Enhanced | P0 |
| Dashboard Widgets | 0 | 5 | 5 | P0 |
| Dashboard Panels | 0 | 3 | 3 | P0 |
| Payment Collection Steps | 0 | 4 | 4 | P0 |
| Receipt Generation | None | PDF | Full | P0 |
| Reports | Basic | 8 types | 6+ | P1 |
| Student Search | None | Advanced | Full | P1 |
| Export Formats | None | CSV/XLSX/PDF | All | P1 |
| RBAC | Basic | Full matrix | Enhanced | P1 |
| Audit Trail | Basic | Complete | Enhanced | P1 |
| NRI USD Tracking | None | Required | Full | P2 |
| Refund Management | Basic | Complete | Enhanced | P2 |
| Plan Versioning | None | Required | Full | P2 |

---

## 🚀 Estimated Timeline

**Total Effort**: 55 development days  
**With 1 Developer**: 10-12 weeks  
**With 2 Developers**: 6-8 weeks  

**Minimum Viable Product (MVP)**: P0 items only = 35 days = 7 weeks (1 dev)

---

**Status**: Requirements mapped, gaps identified, ready for implementation 📝✅
