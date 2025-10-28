# Quick Test Checklist - Student Edit Form

## ✅ Pre-Test Setup
1. Backend running: `http://localhost:5000`
2. Frontend running: `http://localhost:4200`
3. Logged in as admin: `thilak.askan@gmail.com`
4. Browser DevTools open (F12) → Console tab

---

## 🧪 Test 1: Load Edit Form (2 minutes)

**Steps:**
1. Go to Students list
2. Click on any student
3. Click "Edit" button

**Expected Results:**
- [ ] Form loads without errors
- [ ] All fields are pre-filled with student data
- [ ] No "Missing or Invalid Fields" message
- [ ] Validation summary shows green checkmarks

**Console Check:**
```
✅ Look for:
"Populating form with student data: {...}"
"Form validity: true"
"Form errors: {}" ← Should be empty object
```

---

## 🧪 Test 2: Check Semester Field (1 minute)

**Steps:**
1. In edit form, go to Step 2 (Academic Details)
2. Look at Semester dropdown

**Expected Results:**
- [ ] Semester dropdown shows selected value (e.g., "Semester 1")
- [ ] Dropdown is NOT blank
- [ ] Can select different semester

**Console Check:**
```javascript
Form values after patchValue: {
  semester: 1,  // ← Should be NUMBER, not null
}
```

---

## 🧪 Test 3: Check All Required Fields (2 minutes)

**Go through each step and verify:**

**Step 1: Basic Information**
- [ ] First Name - filled ✅
- [ ] Last Name - filled ✅
- [ ] Student ID - filled ✅
- [ ] Enrollment Number - filled ✅
- [ ] Email - filled ✅
- [ ] Contact Number - filled (10 digits) ✅
- [ ] Date of Birth - filled ✅
- [ ] Gender - selected ✅
- [ ] Blood Group - filled ✅
- [ ] Permanent Address - filled ✅
- [ ] Password field - NOT VISIBLE (edit mode) ✅

**Step 2: Academic Details**
- [ ] Program Name - selected ✅
- [ ] Academic Year - selected ✅
- [ ] **Semester - selected** ✅ ← KEY FIELD
- [ ] **Section - selected** ✅
- [ ] **Roll Number - filled** ✅
- [ ] Student Type - selected ✅
- [ ] Status - selected ✅
- [ ] Admission Date - filled ✅

**Step 3: Guardian & Emergency**
- [ ] Guardian Name - filled ✅
- [ ] Guardian Contact - filled (10 digits) ✅
- [ ] Emergency Contact Name - filled ✅
- [ ] Emergency Contact Number - filled (10 digits) ✅

---

## 🧪 Test 4: Validation Summary (1 minute)

**Check the validation summary panel (top of form):**

**Expected:**
- [ ] Shows: "Required Fields: 21/21" (or 100%)
- [ ] Progress bar is GREEN and full
- [ ] All three sections have green checkmarks:
  - ✅ Basic Information
  - ✅ Academic Details
  - ✅ Guardian & Emergency
- [ ] NO red "Missing or Invalid Fields" section
- [ ] NO "Show All Errors" button visible

---

## 🧪 Test 5: Edit and Save (2 minutes)

**Steps:**
1. Change email to: `updated.email@example.com`
2. Change section to: `B`
3. Change roll number to: `999`
4. Click "Update Student"

**Expected Results:**
- [ ] No validation errors
- [ ] Success notification appears
- [ ] Redirects to student list
- [ ] Changes visible in list

**Verify Changes:**
1. Click on the same student again
2. [ ] Email shows updated value
3. [ ] Section shows "B"
4. [ ] Roll number shows "999"

---

## 🧪 Test 6: Password Not Required (1 minute)

**Check:**
- [ ] In edit mode, password field is NOT visible
- [ ] Can save without entering password
- [ ] No "password required" error

**Console Check:**
```javascript
// When clicking submit, should NOT see:
Form errors: {
  "password": { "required": true }  // ← Should NOT appear
}
```

---

## 🐛 If Tests Fail

### If "Missing or Invalid Fields" appears:

**Step 1: Check Console**
```javascript
Form errors: {
  "semester": { "required": true },  // ← Which field?
  "contactNumber": { "pattern": true }  // ← What error?
}
```

**Step 2: Click "Show All Errors"**
- Shows exact field names that are invalid

**Step 3: Common Issues**
| Field | Error | Fix |
|-------|-------|-----|
| semester | required | Should be 1-10, not null |
| contactNumber | pattern | Must be exactly 10 digits |
| email | email | Must be valid email format |
| guardianContact | pattern | Must be exactly 10 digits |

**Step 4: Report the Issue**
Copy and paste console logs:
```
Form values after patchValue: {...}
Form errors: {...}
```

---

## ✅ Success Criteria

All tests pass when:
1. ✅ Form loads with all fields filled
2. ✅ Semester dropdown shows selected value
3. ✅ Validation summary shows 100% complete
4. ✅ No "Missing or Invalid Fields" error
5. ✅ Can save changes successfully
6. ✅ Password not required in edit mode

---

## 📊 Quick Status Check

After testing, mark your results:

- [ ] ✅ Test 1: Load Edit Form - **PASS**
- [ ] ✅ Test 2: Semester Field - **PASS**
- [ ] ✅ Test 3: All Required Fields - **PASS**
- [ ] ✅ Test 4: Validation Summary - **PASS**
- [ ] ✅ Test 5: Edit and Save - **PASS**
- [ ] ✅ Test 6: Password Not Required - **PASS**

**Overall Status**: ✅ PASS / ❌ FAIL

**Issues Found**: [List any issues]

---

**Time Required**: ~10 minutes total  
**Difficulty**: Easy  
**Tools**: Browser DevTools (F12)
