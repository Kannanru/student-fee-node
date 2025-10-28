# Fine Amount Feature - Testing Guide

## 🧪 Quick Testing Steps

### Prerequisites
- Backend server running (`npm run dev` in `/backend`)
- Frontend running (`ng serve` in `/frontend`)
- MongoDB running with test data

---

## Test 1: Create Fee Structure with Fine

1. **Login as Admin**
   - Navigate to: http://localhost:4200/login
   - Use admin credentials

2. **Create New Fee Structure**
   - Go to: **Fees → Fee Structures → Create New**
   
3. **Fill Basic Information**
   - Code: `TEST-FINE-2025`
   - Name: `Test Fee Structure with Fine`
   - Description: `Testing late payment fine feature`
   - Click **Next**

4. **Academic Details**
   - Program: `MBBS`
   - Department: Select any
   - Year: `1`
   - Semester: `1`
   - Academic Year: `2024-2025`
   - Effective From: Today's date
   - **Payment Mode**: Select `2 Installments`
   - Click **Next**

5. **Verify Installment Configuration Appears** ✅
   - You should see **"Installment Configuration"** section
   - Should show **2 installment cards**:
     - Installment 1 of 2
     - Installment 2 of 2

6. **Configure Installment 1**
   - **Due Date**: Set to **yesterday's date** (to trigger fine)
   - **Amount**: `25000`
   - **Fine Per Day**: `10`
   - **Description**: `First Installment`

7. **Configure Installment 2**
   - **Due Date**: Set to **2 months from now**
   - **Amount**: `25000`
   - **Fine Per Day**: `15`
   - **Description**: `Second Installment`

8. **Select Quota**
   - Choose any quota (e.g., Management)
   - Click **Next**

9. **Add Fee Heads**
   - Add at least one fee head
   - Set amount (e.g., ₹50,000)
   - Click **Submit**

10. **Verify Success** ✅
    - Should see success message
    - Navigate to Fee Structures list
    - Verify new structure appears

---

## Test 2: Collect Payment with Fine

1. **Navigate to Fee Collection**
   - Go to: **Fees → Fee Collection**

2. **Search and Select Student**
   - Search for any student
   - Select student from results

3. **Select Fee Structure**
   - Choose the fee structure created in Test 1
   - Click **Load Fee Heads**

4. **Verify Fine Calculation** ✅
   - **Check for fine display section**:
   ```
   ⚠️ Late Payment Fine (X days × ₹10/day): ₹XXX
   ```
   - Verify calculation is correct:
     - Days = (Today - Due Date)
     - Fine = Days × ₹10

5. **Check Total Amount** ✅
   - Total should equal: Fee Amount + Fine Amount

6. **Select Fee Heads**
   - Check at least one fee head
   - Verify total updates

7. **Fill Payment Details**
   - Payment Mode: `Online`
   - Transaction ID: `TEST-TXN-001`
   - Remarks: `Testing fine feature`

8. **Submit Payment**
   - Click **Submit Payment**
   - Verify success message

9. **Verify Payment Record** ✅
   - Check browser console or network tab
   - Payment payload should include:
     ```json
     {
       "amount": 25000,
       "fineAmount": 90,
       "daysDelayed": 9,
       "finePerDay": 10,
       "totalAmountWithFine": 25090
     }
     ```

---

## Test 3: On-Time Payment (No Fine)

1. **Create Another Fee Structure**
   - Follow Test 1 steps
   - **Set Due Date to FUTURE date** (e.g., next month)

2. **Collect Payment**
   - Follow Test 2 steps

3. **Verify NO Fine** ✅
   - Fine section should NOT appear
   - Total = Fee Amount (no fine added)

---

## Test 4: Multiple Installments

1. **Create Fee Structure with 4 Installments**
   - Payment Mode: `4 Installments`

2. **Verify 4 Installment Cards Appear** ✅
   - Should see:
     - Installment 1 of 4
     - Installment 2 of 4
     - Installment 3 of 4
     - Installment 4 of 4

3. **Configure Different Fine Rates**
   - Installment 1: ₹5/day
   - Installment 2: ₹10/day
   - Installment 3: ₹15/day
   - Installment 4: ₹20/day

4. **Save and Test**

---

## Expected Results Summary

### ✅ Fee Structure Form
- [ ] Installment configuration section appears when mode is selected
- [ ] Number of installment cards matches selected mode (1, 2, or 4)
- [ ] All fields are present: Due Date, Amount, Amount USD (if applicable), Fine Per Day, Description
- [ ] Default due dates are 2 months apart
- [ ] Form validation works (required fields marked)

### ✅ Fee Collection
- [ ] Fine calculates automatically when fee structure loads
- [ ] Fine only appears for overdue installments
- [ ] Days delayed calculation is accurate
- [ ] Fine amount = Days × Fine Per Day
- [ ] Total amount includes fine
- [ ] Warning icon and red styling appear
- [ ] Breakdown shows: "X days × ₹Y/day"

### ✅ Payment Submission
- [ ] Payment submits successfully with fine
- [ ] Payment record includes all fine fields
- [ ] No errors in console
- [ ] Success notification appears

---

## Database Verification

### Check Fee Structure in MongoDB
```bash
use mgdc_fees
db.feeplans.findOne({ code: "TEST-FINE-2025" })
```

**Verify:**
```json
{
  "dueDates": [
    {
      "installmentNumber": 1,
      "dueDate": ISODate("..."),
      "amount": 25000,
      "finePerDay": 10  // ✅ Should be present
    }
  ]
}
```

### Check Payment Record in MongoDB
```bash
db.payments.find().sort({ createdAt: -1 }).limit(1)
```

**Verify:**
```json
{
  "amount": 25000,
  "fineAmount": 90,        // ✅ Should be present
  "daysDelayed": 9,        // ✅ Should be present
  "finePerDay": 10,        // ✅ Should be present
  "totalAmountWithFine": 25090  // ✅ Should be present
}
```

---

## Troubleshooting

### Issue: Installment section not appearing
**Solution**: 
- Check browser console for errors
- Verify `dueDatesArray` getter is defined
- Ensure `updateInstallments()` is called on form init

### Issue: Fine not calculating
**Solution**:
- Verify due date is in the past
- Check `calculateFineAmount()` method is called
- Verify `finePerDay` exists in fee structure

### Issue: Fine not showing in payment
**Solution**:
- Check browser network tab for API payload
- Verify `submitPayment()` includes fine fields
- Check backend controller accepts fine fields

### Issue: Form validation errors
**Solution**:
- Ensure all required fields are filled
- Check `dueDatesArray.markAllAsTouched()` is called
- Verify validators are set correctly

---

## Browser Console Tests

### Test Fine Calculation Manually
```javascript
// In browser console on fee collection page
const today = new Date();
const dueDate = new Date('2025-01-15'); // Past date
const diffTime = today.getTime() - dueDate.getTime();
const daysDelayed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
const finePerDay = 10;
const fineAmount = daysDelayed * finePerDay;
console.log(`Days Delayed: ${daysDelayed}, Fine: ₹${fineAmount}`);
```

---

## Success Criteria

### Feature is working correctly if:
1. ✅ Admin can set due date and fine per day in fee structure
2. ✅ Different installments can have different fine rates
3. ✅ Fine calculates automatically on fee collection
4. ✅ Fine only applies to overdue payments
5. ✅ Fine displays with warning styling
6. ✅ Total amount includes fine
7. ✅ Payment record stores all fine details
8. ✅ No errors in browser console
9. ✅ No backend errors in terminal

---

## Screenshot Checklist

**Capture screenshots of:**
1. Fee structure form with installment configuration
2. Fee collection page with fine warning
3. Payment summary showing fine breakdown
4. MongoDB document with fine fields
5. Success message after payment

---

## Next Testing Phase

After basic tests pass:
1. Test with real student data
2. Test edge cases (0 fine, very large fine)
3. Test concurrent payments
4. Test receipt generation with fine
5. Performance testing with bulk payments

---

**Testing Date**: January 2025  
**Tested By**: [Your Name]  
**Status**: ⏳ Pending Testing
