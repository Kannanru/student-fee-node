# Fee Module - Quick Start Guide

## 🎯 Immediate Actions (Today)

### Current Status Check ✅

**What We Have:**
- ✅ Basic backend structure (server running on port 5000)
- ✅ Employee module completed with validations
- ✅ Basic fee models (FeeHead, FeePlan, Fee)
- ✅ Empty frontend components (placeholders)

**What We Need:**
- ❌ Fee Dashboard with widgets
- ❌ Quota-based fee plans
- ❌ Payment collection workflow
- ❌ Receipt generation (PDF)
- ❌ Advanced reports

---

## 📋 Phase 1 Implementation (Start Now)

### Step 1: Review Existing Fee Models (15 mins)

```powershell
# Check current fee models
code c:\Attendance\MGC\backend\models\FeeHead.js
code c:\Attendance\MGC\backend\models\FeePlan.js
code c:\Attendance\MGC\backend\models\Fee.js
```

**Current FeeHead fields:**
- name, code, taxability, glCode, status

**Missing fields needed:**
- category, frequency, isRefundable, defaultAmount, description

---

### Step 2: Create Enhanced Models (Day 1)

#### Task 1.1: Create QuotaConfig Model

```javascript
// backend/models/QuotaConfig.js - CREATE NEW FILE

const mongoose = require('mongoose');

const quotaConfigSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ['puducherry-ut', 'all-india', 'nri', 'self-sustaining']
  },
  name: { 
    type: String, 
    required: true 
  },
  description: String,
  defaultCurrency: { 
    type: String, 
    enum: ['INR', 'USD'], 
    default: 'INR' 
  },
  requiresUSDTracking: { 
    type: Boolean, 
    default: false 
  },
  displayOrder: { 
    type: Number, 
    default: 0 
  },
  active: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('QuotaConfig', quotaConfigSchema);
```

#### Task 1.2: Create Seed Script for Quotas

```javascript
// backend/scripts/seed_quota_configs.js - CREATE NEW FILE

const mongoose = require('mongoose');
const QuotaConfig = require('../models/QuotaConfig');

const quotas = [
  {
    code: 'puducherry-ut',
    name: 'Puducherry UT Quota',
    description: 'Students from Puducherry Union Territory',
    defaultCurrency: 'INR',
    requiresUSDTracking: false,
    displayOrder: 1,
    active: true
  },
  {
    code: 'all-india',
    name: 'All India Quota',
    description: 'All India quota students',
    defaultCurrency: 'INR',
    requiresUSDTracking: false,
    displayOrder: 2,
    active: true
  },
  {
    code: 'nri',
    name: 'NRI/NRI Sponsored Quota',
    description: 'Non-Resident Indian students',
    defaultCurrency: 'USD',
    requiresUSDTracking: true,
    displayOrder: 3,
    active: true
  },
  {
    code: 'self-sustaining',
    name: 'Self-Sustaining Quota',
    description: 'Self-sustaining program students',
    defaultCurrency: 'INR',
    requiresUSDTracking: false,
    displayOrder: 4,
    active: true
  }
];

async function seedQuotas() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
    
    // Clear existing
    await QuotaConfig.deleteMany({});
    console.log('Cleared existing quota configs');
    
    // Insert new
    await QuotaConfig.insertMany(quotas);
    console.log(`✅ Seeded ${quotas.length} quota configurations`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding quotas:', error);
    process.exit(1);
  }
}

seedQuotas();
```

#### Task 1.3: Run Seed Script

```powershell
cd c:\Attendance\MGC\backend
node scripts/seed_quota_configs.js
```

---

### Step 3: Create Seed Data for Fee Heads (Day 1)

```javascript
// backend/scripts/seed_fee_heads.js - CREATE NEW FILE

const mongoose = require('mongoose');
const FeeHead = require('../models/FeeHead');

const feeHeads = [
  {
    name: 'Admission Fee',
    code: 'ADM',
    category: 'academic',
    frequency: 'one-time',
    isRefundable: false,
    taxability: false,
    defaultAmount: 5000,
    description: 'One-time admission fee',
    displayOrder: 1,
    status: 'active'
  },
  {
    name: 'Tuition Fee',
    code: 'TUI',
    category: 'academic',
    frequency: 'semester',
    isRefundable: false,
    taxability: true,
    defaultAmount: 100000,
    description: 'Semester tuition fee',
    displayOrder: 2,
    status: 'active'
  },
  {
    name: 'Special Fee',
    code: 'SPL',
    category: 'academic',
    frequency: 'semester',
    isRefundable: false,
    taxability: false,
    defaultAmount: 25000,
    description: 'Special fee for additional services',
    displayOrder: 3,
    status: 'active'
  },
  {
    name: 'Library Fee',
    code: 'LIB',
    category: 'academic',
    frequency: 'semester',
    isRefundable: true,
    taxability: false,
    defaultAmount: 5000,
    description: 'Library access and books',
    displayOrder: 4,
    status: 'active'
  },
  {
    name: 'Identity Card Fee',
    code: 'IDC',
    category: 'miscellaneous',
    frequency: 'one-time',
    isRefundable: false,
    taxability: false,
    defaultAmount: 500,
    description: 'Student identity card',
    displayOrder: 5,
    status: 'active'
  },
  {
    name: 'Student Council Fee',
    code: 'STU',
    category: 'miscellaneous',
    frequency: 'annual',
    isRefundable: false,
    taxability: false,
    defaultAmount: 1000,
    description: 'Student council activities',
    displayOrder: 6,
    status: 'active'
  },
  {
    name: 'Laboratory Fee',
    code: 'LAB',
    category: 'academic',
    frequency: 'semester',
    isRefundable: false,
    taxability: false,
    defaultAmount: 15000,
    description: 'Laboratory equipment and materials',
    displayOrder: 7,
    status: 'active'
  },
  {
    name: 'Caution Deposit',
    code: 'CAU',
    category: 'miscellaneous',
    frequency: 'one-time',
    isRefundable: true,
    taxability: false,
    defaultAmount: 10000,
    description: 'Refundable security deposit',
    displayOrder: 8,
    status: 'active'
  },
  {
    name: 'Sports Fee',
    code: 'SPO',
    category: 'miscellaneous',
    frequency: 'annual',
    isRefundable: false,
    taxability: false,
    defaultAmount: 2000,
    description: 'Sports facilities and activities',
    displayOrder: 9,
    status: 'active'
  },
  {
    name: 'Alumni Fee',
    code: 'ALU',
    category: 'miscellaneous',
    frequency: 'one-time',
    isRefundable: false,
    taxability: false,
    defaultAmount: 1000,
    description: 'Alumni association membership',
    displayOrder: 10,
    status: 'active'
  },
  {
    name: 'Welfare Fund',
    code: 'WEL',
    category: 'miscellaneous',
    frequency: 'annual',
    isRefundable: false,
    taxability: false,
    defaultAmount: 1500,
    description: 'Student welfare fund',
    displayOrder: 11,
    status: 'active'
  },
  {
    name: 'Hostel Rent',
    code: 'HOS',
    category: 'hostel',
    frequency: 'semester',
    isRefundable: false,
    taxability: false,
    defaultAmount: 20000,
    description: 'Hostel accommodation charges',
    displayOrder: 12,
    status: 'active'
  },
  {
    name: 'Hostel Caution Deposit',
    code: 'HCD',
    category: 'hostel',
    frequency: 'one-time',
    isRefundable: true,
    taxability: false,
    defaultAmount: 5000,
    description: 'Refundable hostel security deposit',
    displayOrder: 13,
    status: 'active'
  }
];

async function seedFeeHeads() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
    
    // Note: We need to enhance FeeHead model first
    // For now, just seed with existing fields
    const existingFields = feeHeads.map(h => ({
      name: h.name,
      code: h.code,
      taxability: h.taxability,
      glCode: h.code,
      status: h.status
    }));
    
    await FeeHead.deleteMany({});
    console.log('Cleared existing fee heads');
    
    await FeeHead.insertMany(existingFields);
    console.log(`✅ Seeded ${existingFields.length} fee heads`);
    
    console.log('\n⚠️ Note: Fee heads seeded with basic fields only.');
    console.log('Run this script again after enhancing FeeHead model to include:');
    console.log('  - category, frequency, isRefundable, defaultAmount, description, displayOrder');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding fee heads:', error);
    process.exit(1);
  }
}

seedFeeHeads();
```

---

## 🎯 Priority Tasks Matrix

### This Week (P0 - Critical)

| Day | Task | Duration | Files |
|-----|------|----------|-------|
| Mon | Create QuotaConfig model | 1h | models/QuotaConfig.js |
| Mon | Seed quota configs | 30m | scripts/seed_quota_configs.js |
| Mon | Enhance FeeHead model | 2h | models/FeeHead.js |
| Tue | Seed fee heads (13 heads) | 1h | scripts/seed_fee_heads.js |
| Tue | Enhance FeePlan model | 3h | models/FeePlan.js |
| Wed | Create StudentBill model | 4h | models/StudentBill.js |
| Thu | Enhance Payment model | 3h | models/Payment.js |
| Fri | Create dashboard controller | 4h | controllers/dashboardController.js |

### Next Week (P0 - Critical)

| Day | Task | Duration |
|-----|------|----------|
| Mon | Dashboard service & APIs | 4h |
| Tue | Fee dashboard component (frontend) | 6h |
| Wed | Dashboard widgets UI | 6h |
| Thu | Testing dashboard | 4h |
| Fri | Start payment collection UI | 4h |

---

## 📝 File Creation Checklist

### Backend - New Files

```powershell
# Models
- [ ] backend/models/QuotaConfig.js
- [ ] backend/models/StudentBill.js
- [ ] backend/models/Refund.js

# Controllers
- [ ] backend/controllers/dashboardController.js
- [ ] backend/controllers/studentBillController.js
- [ ] backend/controllers/paymentCollectionController.js

# Services
- [ ] backend/services/dashboard.service.js
- [ ] backend/services/payment-collection.service.js
- [ ] backend/services/receipt.service.js
- [ ] backend/services/statement.service.js

# Routes
- [ ] backend/routes/dashboard.js
- [ ] backend/routes/studentBill.js

# Scripts
- [ ] backend/scripts/seed_quota_configs.js
- [ ] backend/scripts/seed_fee_heads.js (enhanced)
- [ ] backend/scripts/seed_sample_plans.js
- [ ] backend/scripts/migrate_fee_to_bill.js

# Utils
- [ ] backend/utils/receipt-generator.js (PDF)
- [ ] backend/utils/statement-generator.js (PDF)
```

### Backend - Files to Enhance

```powershell
- [ ] backend/models/FeeHead.js (add 5 fields)
- [ ] backend/models/FeePlan.js (add quota, version, USD)
- [ ] backend/models/Payment.js (add receipt, modes, audit)
- [ ] backend/controllers/feeController.js (update logic)
- [ ] backend/routes/fees.js (add new endpoints)
```

### Frontend - New Components

```powershell
# Fee Module Components
- [ ] frontend/src/app/components/fees/fee-dashboard/fee-dashboard.component.ts
- [ ] frontend/src/app/components/fees/fee-dashboard/fee-dashboard.component.html
- [ ] frontend/src/app/components/fees/fee-dashboard/fee-dashboard.component.css

# Enhance existing (currently empty)
- [ ] frontend/src/app/components/fees/fee-collection/fee-collection.component.ts
- [ ] frontend/src/app/components/fees/fee-structure/fee-structure.component.ts
- [ ] frontend/src/app/components/fees/student-fees/student-fees.component.ts
- [ ] frontend/src/app/components/fees/fee-reports/fee-reports.component.ts
```

---

## 🚀 Quick Commands

### Create All Required Backend Files

```powershell
# Navigate to backend
cd c:\Attendance\MGC\backend

# Create new model files
New-Item -ItemType File -Path "models\QuotaConfig.js" -Force
New-Item -ItemType File -Path "models\StudentBill.js" -Force
New-Item -ItemType File -Path "models\Refund.js" -Force

# Create new controller files
New-Item -ItemType File -Path "controllers\dashboardController.js" -Force
New-Item -ItemType File -Path "controllers\studentBillController.js" -Force

# Create new service files
New-Item -ItemType Directory -Path "services" -Force
New-Item -ItemType File -Path "services\dashboard.service.js" -Force
New-Item -ItemType File -Path "services\payment-collection.service.js" -Force
New-Item -ItemType File -Path "services\receipt.service.js" -Force

# Create script files
New-Item -ItemType File -Path "scripts\seed_quota_configs.js" -Force
New-Item -ItemType File -Path "scripts\seed_fee_heads_enhanced.js" -Force

# Create route files
New-Item -ItemType File -Path "routes\dashboard.js" -Force
New-Item -ItemType File -Path "routes\studentBill.js" -Force
```

### Create All Required Frontend Components

```powershell
# Navigate to frontend
cd c:\Attendance\MGC\frontend

# Generate fee dashboard component
ng generate component components/fees/fee-dashboard --standalone

# Or manually create if ng command doesn't work
New-Item -ItemType Directory -Path "src\app\components\fees\fee-dashboard" -Force
New-Item -ItemType File -Path "src\app\components\fees\fee-dashboard\fee-dashboard.component.ts" -Force
New-Item -ItemType File -Path "src\app\components\fees\fee-dashboard\fee-dashboard.component.html" -Force
New-Item -ItemType File -Path "src\app\components\fees\fee-dashboard\fee-dashboard.component.css" -Force
```

---

## 📊 Success Metrics

### Week 1 Goals

- [x] ✅ Implementation plan created
- [ ] ⬜ QuotaConfig model created and seeded
- [ ] ⬜ FeeHead model enhanced (5 new fields)
- [ ] ⬜ 13 fee heads seeded in database
- [ ] ⬜ FeePlan model enhanced (quota support)
- [ ] ⬜ StudentBill model created
- [ ] ⬜ Backend compiles without errors
- [ ] ⬜ Basic dashboard API responds

### Week 2 Goals

- [ ] ⬜ Dashboard frontend shows 5 widgets
- [ ] ⬜ Real data from database displayed
- [ ] ⬜ Payment collection UI (step 1: search)
- [ ] ⬜ Student search working
- [ ] ⬜ Outstanding bills displayed

---

## 🎓 Learning Resources

### PDF Generation (for Receipts)

```javascript
// Install pdfkit
npm install pdfkit

// Basic receipt generation
const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateReceipt(payment) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(fs.createWriteStream('receipt.pdf'));
  
  // Header
  doc.fontSize(20).text('FEE RECEIPT', { align: 'center' });
  doc.moveDown();
  
  // Receipt details
  doc.fontSize(12).text(`Receipt No: ${payment.receiptNumber}`);
  doc.text(`Date: ${payment.paymentDate}`);
  doc.text(`Student: ${payment.studentName}`);
  // ... more content
  
  doc.end();
}
```

### Date Formatting

```javascript
// Install date-fns
npm install date-fns

const { format, parseISO } = require('date-fns');

// Format dates
const formatted = format(new Date(), 'dd-MM-yyyy');
const academicYear = '2025-2026';
```

---

## 🆘 Troubleshooting

### Issue 1: MongoDB Connection

```powershell
# Check if MongoDB is running
Get-Service MongoDB

# Start MongoDB
net start MongoDB

# Test connection
mongo
use mgdc_fees
db.stats()
```

### Issue 2: Seed Script Fails

```javascript
// Add error handling
try {
  await mongoose.connect(mongoUri);
} catch (error) {
  console.error('Connection error:', error);
  console.log('Make sure MongoDB is running!');
  process.exit(1);
}
```

### Issue 3: Model Validation Errors

```javascript
// Check what's failing
const feeHead = new FeeHead({ name: 'Test' });
const validationError = feeHead.validateSync();
console.log(validationError);
```

---

## 📞 Next Steps

1. **Review** the comprehensive implementation plan
2. **Start** with QuotaConfig and FeeHead enhancements
3. **Seed** initial data
4. **Create** dashboard APIs
5. **Build** dashboard UI
6. **Test** with sample data
7. **Move** to payment collection

---

## ✅ Today's Action Items

```
[ ] 1. Review FEE_MODULE_IMPLEMENTATION_PLAN.md (30 mins)
[ ] 2. Create QuotaConfig model (1 hour)
[ ] 3. Create seed script for quotas (30 mins)
[ ] 4. Run seed script and verify (15 mins)
[ ] 5. Start enhancing FeeHead model (1 hour)
[ ] 6. Commit changes to git
```

---

**Status**: 📝 Plan created, ready for implementation!  
**Next**: Create QuotaConfig model and seed data 🚀
