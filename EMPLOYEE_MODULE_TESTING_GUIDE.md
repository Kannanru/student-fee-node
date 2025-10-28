# Employee Module - Quick Testing Guide

## Prerequisites
- Backend server running on `http://localhost:5000`
- Frontend running on `http://localhost:4200`
- Logged in as admin user
- MongoDB running and connected

---

## Test 1: Create New Employee ✅

### Steps:
1. Navigate to `http://localhost:4200/employees`
2. Click **"Add New Employee"** button (+ icon)
3. **Step 1 - Basic Information:**
   - Employee ID: `EMP001`
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john.doe@college.com`
   - Phone: `9876543210`
   - Date of Birth: Select any date
   - Gender: Select `Male`
   - Blood Group: Select `O+`
   - Click **"Next"**

4. **Step 2 - Professional Details:**
   - Joining Date: Select today's date
   - Status: Select `Active`
   - Department: Select `Computer Science`
   - Designation: Select `Professor`
   - Category: Select `Faculty`
   - Qualification: `PhD in Computer Science`
   - Experience: `10`
   - Click **"Next"**

5. **Step 3 - Contact Details:**
   - Street: `123 Main Street`
   - City: `Mumbai`
   - State: `Maharashtra`
   - Pincode: `400001`
   - Country: `India`
   - Emergency Contact Name: `Jane Doe`
   - Emergency Contact Relation: `Spouse`
   - Emergency Contact Phone: `9876543211`
   - Click **"Next"**

6. **Step 4 - Salary Details:**
   - Basic Salary: `50000`
   - Allowances: `10000`
   - Total Salary: `60000` (auto-calculated)

7. Click **"Create Employee"**

### Expected Results:
- ✅ Success notification appears
- ✅ Redirected to employee list
- ✅ New employee appears in list
- ✅ Statistics cards updated (Faculty count +1)
- ✅ Backend logs show employee creation
- ✅ MongoDB document created

### Console Logs to Check:
**Frontend (Browser Console):**
```
📤 Submitting employee data: {...}
✅ Employee created successfully: {...}
```

**Backend (Terminal):**
```
📝 Employee creation request received
Request body keys: [...]
✅ All required fields present
Creating employee: {...}
✅ Employee created successfully: [id]
```

---

## Test 2: View Employee Details ✅

### Steps:
1. From employee list, click on **John Doe** card
2. Verify employee detail page opens

### Expected Results:
- ✅ Header shows employee photo placeholder
- ✅ Name displayed: "John Doe"
- ✅ Employee ID: EMP001
- ✅ Designation: Professor • Computer Science
- ✅ Status chip shows "Active" (blue)
- ✅ Category chip shows "Faculty"
- ✅ **Personal Information Tab:**
  - All 7 fields displayed correctly
- ✅ **Professional Details Tab:**
  - All 7 fields displayed correctly
  - Experience shows "10 years"
- ✅ **Address & Contact Tab:**
  - Complete address displayed
  - Emergency contact details shown
- ✅ **Salary Details Tab:**
  - Basic Salary: ₹50,000
  - Allowances: ₹10,000
  - Total Salary: ₹60,000 (highlighted)

---

## Test 3: Edit Employee ✅

### Steps:
1. From employee detail page, click **Edit** (pencil icon)
2. Modify fields:
   - Change Phone to: `9876543299`
   - Change Experience to: `12`
   - Change Basic Salary to: `55000`
   - Total Salary auto-updates to: `65000`
3. Click **"Update Employee"**

### Expected Results:
- ✅ Success notification appears
- ✅ Redirected to employee list
- ✅ View employee again - changes reflected
- ✅ Updated phone: 9876543299
- ✅ Updated experience: 12 years
- ✅ Updated total salary: ₹65,000

### Console Logs:
**Frontend:**
```
📤 Updating employee: [id] {...}
✅ Employee updated successfully: {...}
```

**Backend:**
```
📝 Employee update request received
Employee ID: [id]
Update fields: [...]
✅ Employee updated successfully: [id]
```

---

## Test 4: Search Functionality ✅

### Steps:
1. Go to employee list
2. In search box, type: `john`
3. Wait 300ms (debounce)

### Expected Results:
- ✅ List filters to show only John Doe
- ✅ Statistics remain unchanged
- ✅ Backend query executes with search param

### Console Logs:
**Frontend:**
```
Loading employees with filters: { q: 'john' }
✅ Employees loaded: {...}
```

**Backend:**
```
📋 Employee list request received
Query params: { q: 'john' }
Applied filters: {...}
✅ Found 1 employees, returning page 1
```

### Additional Search Tests:
- Search by email: `john.doe@`
- Search by employee ID: `EMP001`
- Search by department: `Computer`
- Each should return matching results

---

## Test 5: Filter by Department ✅

### Steps:
1. From employee list
2. Click **Department** dropdown
3. Select `Computer Science`

### Expected Results:
- ✅ List shows only Computer Science employees
- ✅ Other employees hidden
- ✅ Can combine with search

---

## Test 6: Filter by Category ✅

### Steps:
1. From employee list
2. Click **Category** dropdown
3. Select `Faculty`

### Expected Results:
- ✅ List shows only Faculty category employees
- ✅ Statistics cards still show all counts
- ✅ Can combine with department filter

---

## Test 7: Status Tabs ✅

### Steps:
1. From employee list
2. Click **"Active"** tab

### Expected Results:
- ✅ Shows only active employees
- ✅ Other status tabs show different counts
- ✅ "All" tab shows all employees

---

## Test 8: Delete Employee ✅

### Steps:
1. From employee detail page
2. Click **Delete** (trash icon)
3. Confirm deletion in dialog

### Expected Results:
- ✅ Confirmation dialog appears with employee name
- ✅ After confirm, success notification shows
- ✅ Redirected to employee list
- ✅ Employee removed from list
- ✅ Statistics updated (Faculty count -1)
- ✅ MongoDB document deleted

### Console Logs:
**Frontend:**
```
🗑️ Deleting employee: [id]
✅ Employee deleted successfully
```

**Backend:**
```
🗑️ Employee delete request received
Employee ID: [id]
✅ Employee deleted successfully: [id]
```

---

## Test 9: Form Validation ✅

### Steps:
1. Click "Add New Employee"
2. Try to submit without filling required fields
3. Click "Create Employee"

### Expected Results:
- ✅ Form does not submit
- ✅ Error notification appears
- ✅ Red underlines on required fields
- ✅ Error messages below each field
- ✅ Validation summary panel appears showing all errors

### Test Individual Validations:
1. **Email Format:**
   - Enter: `invalid-email`
   - Error: "Invalid email format"

2. **Phone Number:**
   - Enter: `123`
   - Error: "Valid 10-digit phone number is required"

3. **Employee ID:**
   - Enter: `emp001` (lowercase)
   - Automatically converts to: `EMP001`

4. **Experience:**
   - Enter: `-5`
   - Error: "Experience must be at least 0"

5. **Pincode:**
   - Enter: `123`
   - Error: "Valid 6-digit pincode required"

---

## Test 10: Duplicate Detection ✅

### Steps:
1. Create first employee with email: `test@example.com`
2. Try to create another employee with same email

### Expected Results:
- ✅ Error notification appears
- ✅ Message: "Email already exists"
- ✅ Form stays on page
- ✅ User can correct and retry

### Test for Employee ID:
1. Create employee with ID: `EMP999`
2. Try to create another with same ID
3. Should get error: "Employee ID already exists"

---

## Test 11: Statistics Dashboard ✅

### Create Test Data:
1. Create 2 Faculty members
2. Create 1 Administrative staff
3. Create 1 Technical staff
4. Create 1 Support staff

### Expected Results:
- ✅ Faculty card shows: 2
- ✅ Administrative card shows: 1
- ✅ Technical card shows: 1
- ✅ Support card shows: 1
- ✅ Statistics update after each creation
- ✅ Statistics update after deletion

---

## Test 12: Salary Auto-calculation ✅

### Steps:
1. Go to Add Employee form
2. Navigate to Step 4 (Salary Details)
3. Enter Basic Salary: `40000`
4. Enter Allowances: `5000`

### Expected Results:
- ✅ Total Salary automatically shows: `45000`
- ✅ Total Salary field is readonly
- ✅ Changing Basic Salary updates total
- ✅ Changing Allowances updates total

---

## Test 13: Navigation Flow ✅

### Test Complete Flow:
1. **List → Add:**
   - Click "Add New Employee"
   - URL: `/employees/add`

2. **Add → List (Cancel):**
   - Click "Cancel"
   - Confirmation dialog appears
   - URL: `/employees`

3. **List → View:**
   - Click on employee card
   - URL: `/employees/view/[id]`

4. **View → Edit:**
   - Click "Edit" button
   - URL: `/employees/edit/[id]`
   - Form pre-populated

5. **Edit → View:**
   - Click "Cancel" or "Update"
   - Returns to view page

6. **View → List:**
   - Click "Back" button
   - Returns to list

---

## Test 14: Error Handling ✅

### Test Network Errors:
1. **Stop Backend Server**
2. Try to load employee list

### Expected Results:
- ✅ Error notification appears
- ✅ Message: "Failed to load employee data"
- ✅ Loading spinner stops
- ✅ No console crashes

### Test Not Found:
1. Manually navigate to: `/employees/view/invalid-id`

### Expected Results:
- ✅ Error notification appears
- ✅ Redirected to employee list
- ✅ Message: "Failed to load employee details"

---

## Test 15: Responsive Design ✅

### Mobile View Test:
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone/Mobile view

### Expected Results:
- ✅ Form stacks vertically
- ✅ All fields remain usable
- ✅ Buttons stack vertically
- ✅ Statistics cards stack
- ✅ Detail page remains readable
- ✅ Navigation works properly

---

## Test 16: Data Persistence ✅

### Steps:
1. Create an employee
2. Close browser
3. Restart backend and frontend
4. Login again
5. Navigate to employees

### Expected Results:
- ✅ Previously created employee still appears
- ✅ All details intact
- ✅ Statistics correct
- ✅ Can edit and view

---

## Test 17: Concurrent Operations ✅

### Steps:
1. Open employee list in two browser tabs
2. In Tab 1: Create new employee
3. In Tab 2: Refresh list

### Expected Results:
- ✅ New employee appears in both tabs
- ✅ No conflicts
- ✅ Statistics synchronized

---

## Performance Tests

### Load Test:
1. Create 50+ employees
2. Test list loading time
3. Test search performance
4. Test filter performance

### Expected Results:
- ✅ List loads in < 2 seconds
- ✅ Search responds in < 500ms
- ✅ Filters apply instantly
- ✅ No UI lag

---

## Database Verification

### MongoDB Queries:

**View all employees:**
```javascript
use mgdc_fees
db.employees.find().pretty()
```

**Check specific employee:**
```javascript
db.employees.findOne({ employeeId: "EMP001" })
```

**Count by category:**
```javascript
db.employees.aggregate([
  { $group: { _id: "$category", count: { $sum: 1 } } }
])
```

**Verify indexes:**
```javascript
db.employees.getIndexes()
```

### Expected Indexes:
- _id
- employeeId (unique)
- email (unique)
- department
- category
- status
- firstName + lastName

---

## Common Issues & Solutions

### Issue 1: "Failed to load employee data"
**Solution:** Check backend is running, MongoDB connected

### Issue 2: "Email already exists"
**Solution:** Use unique email for each employee

### Issue 3: Form validation not showing
**Solution:** Check all required fields filled correctly

### Issue 4: Statistics not updating
**Solution:** Refresh page or check backend logs

### Issue 5: Delete not working
**Solution:** Check user has admin permissions

---

## Success Criteria

All tests should pass with:
- ✅ Zero console errors
- ✅ All API calls successful (status 200/201)
- ✅ Data persists across refreshes
- ✅ UI responsive and smooth
- ✅ Notifications appear correctly
- ✅ Backend logs show proper flow
- ✅ MongoDB data matches UI

---

## Final Checklist

- [ ] Can create employee with all fields
- [ ] Can view employee details
- [ ] Can edit employee
- [ ] Can delete employee
- [ ] Search works correctly
- [ ] Filters work correctly
- [ ] Statistics update properly
- [ ] Form validation works
- [ ] Error handling works
- [ ] Navigation flows correctly
- [ ] Responsive design works
- [ ] Data persists in database
- [ ] Duplicate detection works
- [ ] Salary auto-calculation works
- [ ] All console logs appear as expected

**If all checked ✅ - Employee Module is fully functional!**
