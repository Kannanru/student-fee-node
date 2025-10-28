# Quick Test Guide - Duplicate Payment Prevention

## Prerequisites ✅
- Backend running with latest changes
- Frontend running
- Database has test student data

---

## Test Scenario: Prevent Duplicate Payments

### Step 1: First Payment (Partial)
1. Navigate to **Fee Collection** (`http://localhost:4200/fees/collect`)
2. **Select Student**: Choose "Siva Priyan" (or any test student)
3. **Select Fee Structure**: Choose any active structure
4. **View Fee Heads**: Should see list of fee heads
   - ✅ All should be **unpaid** (white background)
   - ✅ All checkboxes should be **enabled**
   - ✅ No payment dates shown

5. **Select 2-3 Fee Heads** (not all):
   - Check "Examination Fee" ✓
   - Check "University Registration" ✓
   - Leave others unchecked

6. **Enter Payment Details**:
   - Mode: Cash
   - Remarks: "First partial payment"

7. **Submit Payment**
   - ✅ Success message with receipt number
   - ✅ Fee heads list should **auto-reload**
   - ✅ Paid heads now show **green background**
   - ✅ Paid heads show "Paid ₹X on DATE"

---

### Step 2: Second Payment (Same Student)

8. **Select Same Student** again: "Siva Priyan"
9. **Select Same Fee Structure**
10. **View Fee Heads**: Should now see:
    ```
    ✅ Examination Fee - ₹3,000
       [PAID - Checkbox disabled, green background]
       Paid ₹3,000 on 21 Oct 2025
    
    ✅ University Registration - ₹10,000
       [PAID - Checkbox disabled, green background]
       Paid ₹10,000 on 21 Oct 2025
    
    ☐ E-Learning Fee - ₹4,000
       [UNPAID - Checkbox enabled, white background]
    
    ☐ Caution Deposit - ₹15,000
       [UNPAID - Checkbox enabled, white background]
    ```

11. **Try to Click Paid Checkbox**:
    - ❌ Should be **disabled** (can't click)
    - ❌ Hover should show "not-allowed" cursor

12. **Select Only Unpaid Heads**:
    - Check "E-Learning Fee" ✓
    - Check "Caution Deposit" ✓

13. **Enter Payment Details** and **Submit**
    - ✅ Payment should succeed
    - ✅ Should show receipt number

---

### Step 3: Third Attempt (All Paid)

14. **Select Same Student** again: "Siva Priyan"
15. **Select Same Fee Structure**
16. **View Fee Heads**: Should now see:
    ```
    ✅ ALL FEE HEADS PAID (green alert box)
    
    [All heads show green background with "PAID" badges]
    [All checkboxes disabled]
    ```

17. **Summary Stats Should Show**:
    ```
    Total: 5 | Paid: 5 | Unpaid: 0 | Selected: 0
    ```

18. **No Payment Possible**:
    - ❌ Cannot select any heads
    - ❌ Payment section should not appear (no selected heads)

---

## Expected Visual Indicators

### Paid Fee Head
- ✅ **Background**: Light green gradient
- ✅ **Checkbox**: Disabled (grayed out)
- ✅ **Badge**: Green "check_circle" icon + "Paid ₹X on DATE"
- ✅ **Border**: Green color
- ✅ **Opacity**: Slightly reduced (0.85)

### Unpaid Fee Head (Not Selected)
- ⬜ **Background**: White
- ⬜ **Checkbox**: Enabled
- ⬜ **Badge**: None
- ⬜ **Border**: Light gray
- ⬜ **Hover**: Blue border + shadow

### Unpaid Fee Head (Selected)
- ☑️ **Background**: Light purple gradient
- ☑️ **Checkbox**: Checked, enabled
- ☑️ **Border**: Purple/blue color
- ☑️ **Shadow**: Enhanced

### Summary Statistics
- **Chips**: Colorful Material chips
  - Total: Default
  - Paid: Accent (teal)
  - Unpaid: Warn (red/orange)
  - Selected: Primary (blue)

---

## Error Cases to Test

### Case 1: Backend Not Updated
**If backend endpoint not fixed**:
- ❌ All heads show as unpaid even after payment
- ❌ Can pay same head multiple times

**Solution**: Restart backend with latest code

### Case 2: Try to Submit Paid Heads
**If somehow user selects paid head** (should be impossible via UI):
- ✅ Frontend validation catches it
- ✅ Shows error: "Cannot pay already paid fee heads: [name]"
- ✅ Payment blocked

### Case 3: Network Error
**If API call fails**:
- ⚠️ Shows error message
- ⚠️ Fee heads don't reload
- ⚠️ User can retry

---

## Database Verification

### Check Invoices After Payment
```javascript
// In MongoDB shell or Compass
db.invoices.find({ 
  studentId: ObjectId("student_id") 
}).pretty()
```

**Expected**:
- One invoice per fee head paid
- Each with `status: 'paid'`
- Each with `feeHeadId` pointing to specific head

### Check Payment Record
```javascript
db.payments.findOne({ 
  receiptNumber: "RCP-2025-00006" 
}).pretty()
```

**Expected**:
- One payment record
- `billId` populated
- `status: 'confirmed'`
- `academicYear` populated

### Check Student Bill
```javascript
db.student_bills.findOne({ 
  billNumber: "BILL-1761050218984" 
}).pretty()
```

**Expected**:
- `heads` array with paid amounts
- `paidAmount` = total paid
- `balanceAmount` = remaining
- `status: 'paid'` if fully paid

---

## Success Criteria

✅ **Payment Prevention**:
- [x] Cannot select already paid fee heads
- [x] Cannot submit payment for paid heads
- [x] Validation blocks duplicate payments

✅ **Visual Indicators**:
- [x] Paid heads show green background
- [x] Paid heads show payment date and amount
- [x] Paid heads have disabled checkboxes
- [x] Unpaid heads clearly distinct

✅ **Auto-Reload**:
- [x] Fee heads reload after payment
- [x] New payment status reflected immediately
- [x] Can continue with remaining unpaid heads

✅ **Summary Stats**:
- [x] Correct count of total/paid/unpaid
- [x] Shows selected count
- [x] Updates in real-time

---

## Common Issues & Solutions

### Issue: Paid heads not showing as paid
**Check**:
1. Backend restarted with latest code?
2. Invoice records exist in database?
3. Invoice status is 'paid'?
4. Browser console errors?

### Issue: Can still select paid heads
**Check**:
1. Frontend code updated?
2. Browser cache cleared?
3. `isPaid` flag in API response?

### Issue: Payment fails after selection
**Check**:
1. Backend validation rejecting?
2. Check backend console logs
3. Verify payment data structure

---

## Quick Commands

### Restart Backend
```powershell
cd c:\Attendance\MGC\backend
npm run dev
```

### Check Backend Logs
Watch terminal for:
```
Found X paid invoices for student Y in structure Z
Fee heads for structure: { total: 5, paid: 2, unpaid: 3 }
```

### Clear Frontend Cache
```
Ctrl + Shift + R (Chrome/Edge)
```

---

**Status**: Ready for testing  
**Estimated Test Time**: 10-15 minutes  
**Last Updated**: October 21, 2025
