# Quick Reference - Fee Structure & Master Setup

## 🚀 Quick Start URLs

### Once Frontend is Running (http://localhost:4200)

#### Dashboard
```
http://localhost:4200/fees
```

#### Master Setup
```
http://localhost:4200/fees/master/fee-heads      # Fee Heads List
http://localhost:4200/fees/master/fee-head/create # Create Fee Head
http://localhost:4200/fees/master/quotas          # Quotas List
http://localhost:4200/fees/master/quota/create    # Create Quota
```

#### Fee Structures
```
http://localhost:4200/fees/structures             # Fee Structures List
http://localhost:4200/fees/fee-structure/create   # Create Fee Structure
```

---

## 🎯 Quick Actions from Dashboard

Click these cards on the Fee Dashboard:

1. **Master Setup** → Configure Fee Heads & Quotas
2. **Fee Structure** → Manage Fee Plans
3. **Collect Payment** → Record Payments
4. **Reports** → View Reports

---

## 📋 Creating Fee Structure - 3 Steps

### Step 1: Setup Fee Heads
1. Click "Master Setup" on dashboard
2. Click "Create Fee Head"
3. Fill: Name, Category, Amount, Tax
4. Save

### Step 2: Setup Quotas
1. Navigate to Quotas tab or `/fees/master/quotas`
2. Click "Create Quota"
3. Select quota type (PU/AI/NRI/SS)
4. Set seat allocation
5. Save

### Step 3: Create Fee Structure
1. Click "Fee Structure" on dashboard
2. Click "Create Fee Structure"
3. Select: Program, Year, Semester, Quota
4. Add fee heads with amounts
5. System auto-calculates totals
6. Save

---

## 🔑 Key Features

### Fee Heads Management
- ✅ Create, Edit, Delete
- ✅ Filter by category/status
- ✅ Search by name/code
- ✅ Toggle active/inactive
- ✅ Tax configuration
- ✅ Default amounts

### Quota Management
- ✅ Create, Edit, Delete
- ✅ Dual currency (INR/USD)
- ✅ Seat allocation tracking
- ✅ Priority ordering
- ✅ Custom UI colors/icons

### Fee Structures
- ✅ Clone existing structures
- ✅ Auto-generate codes
- ✅ Tax calculations
- ✅ Export capabilities
- ✅ Status management

---

## 🧪 Quick Test Checklist

### Backend (Already Running ✅)
- [x] http://localhost:5000/api/fee-heads
- [x] http://localhost:5000/api/fee-heads/active
- [x] http://localhost:5000/api/quota-configs
- [x] http://localhost:5000/api/quota-configs/active
- [x] http://localhost:5000/api/fee-plans

### Frontend (After Node.js Update)
```powershell
# 1. Update Node.js to v22.12.0+

# 2. Start frontend
cd frontend
ng serve

# 3. Access dashboard
# http://localhost:4200/fees
```

### Test Flow
1. ✅ Login as admin
2. ✅ Navigate to fees dashboard
3. ✅ Click "Master Setup"
4. ✅ Create 2-3 fee heads
5. ✅ Navigate to quotas
6. ✅ Verify 4 existing quotas
7. ✅ Navigate to Fee Structures
8. ✅ Create new fee structure
9. ✅ Verify all CRUD operations

---

## 💡 Sample Data

### Sample Fee Head
```json
{
  "name": "Tuition Fee",
  "code": "TUITION_FEE",
  "category": "academic",
  "frequency": "semester",
  "defaultAmount": 50000,
  "taxability": false,
  "status": "active"
}
```

### Sample Quota
```json
{
  "code": "puducherry-ut",
  "name": "Puducherry UT",
  "displayName": "Puducherry UT Quota",
  "defaultCurrency": "INR",
  "seatAllocation": 50,
  "priority": 1,
  "active": true
}
```

---

## 🎨 UI Components

### Colors
- Primary: Blue (#1976d2)
- Success: Green (#2e7d32)
- Warning: Orange (#ef6c00)
- Error: Pink (#c2185b)

### Icons
- Fee Heads: `list_alt`
- Quotas: `people`
- Fee Structure: `account_tree`
- Master Setup: `settings`

---

## 🔧 Troubleshooting

### Issue: Node.js Version Error
**Solution:** Update to v22.12.0+
```powershell
nvm install 22.12.0
nvm use 22.12.0
```

### Issue: Port 5000 in use
**Solution:** Backend already running (this is fine!)

### Issue: Cannot see fee heads
**Solution:** Database already has 13 fee heads
```powershell
cd backend
node scripts/seed_fee_test_data.js
```

---

## 📞 Support

**Documentation:**
- Full Guide: `FEE_STRUCTURE_MASTER_SETUP_COMPLETE.md`
- API Docs: `backend/API_Documentation.md`

**Common Paths:**
- Backend: `c:\Attendance\MGC\backend`
- Frontend: `c:\Attendance\MGC\frontend`
- Components: `frontend\src\app\components\fees`

---

**Last Updated:** October 21, 2025
**Status:** ✅ Ready for Testing
