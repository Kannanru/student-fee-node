# Fee Collection - Quick Start Guide

## 🚀 Start Testing in 5 Minutes

### Step 1: Start Backend (Terminal 1)
```powershell
cd C:\Attendance\MGC\backend
npm run dev
```
✅ Wait for: `Server running on port 5000`

### Step 2: Start Frontend (Terminal 2)
```powershell
cd C:\Attendance\MGC\frontend
ng serve
```
✅ Wait for: `Compiled successfully`
✅ Open: http://localhost:4200

### Step 3: Login as Admin
```
Username: admin@mgdc.com
Password: admin123
```

### Step 4: Navigate to Fee Collection
```
Dashboard → Fees → Fee Collection
Or: http://localhost:4200/fees/fee-collection
```

### Step 5: Test Fee Collection Flow

#### Test 1: Basic Payment
1. **Search Student** - Type "student" in search box
2. **Select Student** - Click on any student from dropdown
3. **View Fee Status** - See paid vs remaining fee heads
4. **Select Fee Heads** - Check 2-3 fee head checkboxes
5. **Check Total** - Total updates automatically at bottom
6. **Choose Payment Mode** - Select "Cash"
7. **Submit** - Click "Process Payment (₹XX,XXX.00)"
8. **Verify** - Success message appears

#### Test 2: Payment with Bank Details
1. **Search & Select Student**
2. **Select Fee Heads**
3. **Choose Payment Mode** - Select "Bank Transfer"
4. **Fill Required Fields:**
   - Bank Name: "HDFC Bank"
   - Transaction ID: "TXN123456789"
5. **Submit Payment**

#### Test 3: Verify Payment History
1. **Re-select Same Student**
2. **Check Fee Heads Table**
   - ✅ Previously paid heads should NOT appear
   - ✅ "Paid Fee Heads" count increased
   - ✅ "Total Paid" amount increased

---

## 🐛 Quick Troubleshooting

### Problem: "No fee structure found"
**Solution:**
1. Go to Fee Structure Management
2. Create fee structure with:
   - Program: BDS
   - Year: 1
   - Semester: 1
   - Quota: Management
3. Add fee heads to structure

### Problem: No students in dropdown
**Solution:**
```powershell
cd backend
npm run seed
```

### Problem: Total not updating
**Cause:** Angular version < 20
**Solution:** Check package.json, must have Angular 20+

### Problem: Backend error "Cannot find module..."
**Solution:**
```powershell
cd backend
npm install
```

---

## 📊 Test Data Setup

If no data exists, run:
```powershell
cd backend
npm run seed
```

This creates:
- ✅ 50 students
- ✅ 20 fee heads
- ✅ 10 fee structures
- ✅ Sample payments

---

## 🔍 Verify Payment in Database

### MongoDB Shell
```javascript
// Connect
mongosh mongodb://localhost:27017/mgdc_fees

// View latest payment
db.payments.find().sort({ createdAt: -1 }).limit(1).pretty()

// Check student's payments
db.payments.find({ 
  studentName: /Test Student/i 
}).pretty()

// Count payments today
db.payments.countDocuments({
  paymentDate: {
    $gte: new Date(new Date().setHours(0,0,0,0))
  }
})
```

### Expected Payment Record
```json
{
  "_id": ObjectId("..."),
  "receiptNumber": "RCP-2025-00001",
  "studentId": ObjectId("..."),
  "studentName": "Test Student",
  "amount": 15000,
  "paymentMode": "cash",
  "headsPaid": [
    {
      "headId": ObjectId("..."),
      "headCode": "LF001",
      "headName": "Library Fee",
      "amount": 5000
    },
    {
      "headId": ObjectId("..."),
      "headCode": "LAB001",
      "headName": "Laboratory Fee",
      "amount": 10000
    }
  ],
  "status": "completed",
  "paymentDate": ISODate("2025-01-20T10:30:00Z")
}
```

---

## ✅ Checklist

Before reporting issues, verify:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 4200
- [ ] Logged in as admin
- [ ] Database seeded with test data
- [ ] Fee structure exists for selected student
- [ ] Student has unpaid fee heads

---

## 📞 Support

If issues persist, check:
1. **Backend logs** in Terminal 1
2. **Frontend console** (F12 in browser)
3. **Network tab** (F12 → Network)
4. **MongoDB connection** (ensure MongoDB is running)

---

**Quick Reference:**
- Backend API: http://localhost:5000/api
- Frontend: http://localhost:4200
- Fee Collection: http://localhost:4200/fees/fee-collection
