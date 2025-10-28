# Student Achievements - Quick Start Testing Guide

## 🚀 Quick Start

### Prerequisites
- ✅ Backend server running on `http://localhost:5000`
- ✅ Frontend running on `http://localhost:4200`
- ✅ MongoDB running with sample student data
- ⚠️ **Node.js version:** Update to v20.19+ or v22.12+ for Angular

---

## 📋 Step-by-Step Testing

### 1. Update Node.js (Required for Frontend)

```powershell
# Check current version
node --version

# If < v20.19, download from:
# https://nodejs.org/en/download/
# Install Node.js v20.19 or v22.12 LTS
```

### 2. Start Backend (Already Running)

```powershell
cd c:\Attendance\MGC\backend
node server.js
```

**Expected Output:**
```
🔌 Socket.IO server initialized
✅ Connected to MongoDB
🚀 Server is running on port 5000
📡 Achievement routes mounted at /api/achievements
```

### 3. Start Frontend

```powershell
cd c:\Attendance\MGC\frontend
npx ng serve
```

**Expected Output:**
```
✔ Browser application bundle generation complete.
✔ Compiled successfully.
** Angular Live Development Server is listening on localhost:4200 **
```

### 4. Access the Application

Open browser: **http://localhost:4200**

---

## 🧪 Test Scenarios

### Scenario 1: Create Achievement (Student)

**Login Credentials:**
- Email: `student@example.com`
- Password: `password123`

**Steps:**
1. After login, navigate to **Students** → **View** (your profile)
2. Click on **Achievements** tab
3. Click **Create Achievement** button
4. Fill the dialog:
   - **Title:** "First Place in Science Fair"
   - **Description:** "Won first place in the annual science fair with my AI-powered robot project"
   - **Image URL:** (optional) Leave blank or enter: `https://via.placeholder.com/400x300/1976d2/ffffff?text=Science+Fair`
5. Click **Submit**

**Expected Results:**
- ✅ Success notification: "Achievement created and sent for approval"
- ✅ Dialog closes
- ⚠️ Achievement does NOT appear in list yet (pending admin approval)

**Verify Backend:**
```powershell
# Check MongoDB for pending achievement
# The achievement should have status='pending'
```

---

### Scenario 2: Approve Achievement (Admin)

**Login Credentials:**
- Email: `admin@mgdc.edu`
- Password: `admin123`

**Steps:**
1. After login, from dashboard click **Achievement Approvals** quick action
2. OR navigate to: **http://localhost:4200/achievements/approvals**
3. You should see the pending achievement created in Scenario 1
4. Verify card shows:
   - Achievement title and description
   - Student name, ID, program
   - Submission date
   - "Pending" status chip (orange)
5. Click **Approve** button
6. Confirm in dialog

**Expected Results:**
- ✅ Success notification: "Achievement approved successfully"
- ✅ Achievement removed from pending list
- ✅ Page refreshes automatically

**Verify Backend:**
```powershell
# Achievement should now have:
# - status='approved'
# - approvedBy=admin_id
# - approvalDate=current_timestamp
```

---

### Scenario 3: View Approved Achievement (Student)

**Login Credentials:**
- Email: `student@example.com`
- Password: `password123`

**Steps:**
1. Navigate to **Students** → **View** (your profile)
2. Click **Achievements** tab

**Expected Results:**
- ✅ Previously created achievement now visible in grid
- ✅ Card shows:
  - Achievement image (or default trophy if no URL)
  - Title: "First Place in Science Fair"
  - Description (truncated to 3 lines)
  - Status chip: "Approved" (green)
  - Approval date
  - Approver name (Admin Name)
- ✅ Hover effect works (card elevates)
- ✅ Delete button visible

---

### Scenario 4: Reject Achievement (Admin)

**Create another achievement as student first, then:**

**Login as Admin:**
1. Navigate to **Achievement Approvals**
2. Click **Reject** button on an achievement
3. Enter rejection reason: "Insufficient evidence provided"
4. Click OK

**Expected Results:**
- ✅ Success notification: "Achievement rejected"
- ✅ Achievement removed from pending list

**Verify as Student:**
- ✅ Login as student
- ✅ Rejected achievement NOT visible in achievements tab

---

### Scenario 5: Delete Achievement (Student)

**Login as Student:**
1. Navigate to your **Achievements** tab
2. Click **Delete** button (trash icon) on an achievement
3. Confirm deletion

**Expected Results:**
- ✅ Confirmation dialog: "Are you sure you want to delete this achievement?"
- ✅ After confirmation: "Achievement deleted successfully"
- ✅ Achievement removed from list
- ✅ Deleted from database

---

## 🎨 UI/UX Validation

### Visual Checks

**Achievements Tab (Student View):**
- [ ] Card grid is responsive (3 columns desktop, 1 mobile)
- [ ] Cards have smooth hover animation
- [ ] Images load correctly (or show default trophy)
- [ ] Status chip is green with checkmark icon
- [ ] Description truncates at 3 lines with ellipsis
- [ ] Approval metadata visible (date, approver)
- [ ] Delete button has red color on hover

**Approvals Page (Admin View):**
- [ ] Header card with blue theme and approval icon
- [ ] Pending cards have orange left border
- [ ] Student info box highlighted in light gray
- [ ] Submission info shows calendar and person icons
- [ ] Approve button is blue, Reject is red
- [ ] Cards elevate on hover

**Achievement Dialog:**
- [ ] Dialog width 600px (full width on mobile)
- [ ] Title and Description marked as required (red asterisk)
- [ ] Image URL field optional
- [ ] Live image preview appears when URL entered
- [ ] Error message if image fails to load
- [ ] Submit button disabled until form valid
- [ ] Cancel closes dialog without action

---

## 🔍 Backend API Testing

### Test Endpoints with REST Client

**Create `test-achievements.http` file:**

```http
### Variables
@baseUrl = http://localhost:5000/api
@token = YOUR_JWT_TOKEN_HERE
@studentId = STUDENT_ID_HERE

### 1. Create Achievement
POST {{baseUrl}}/achievements
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "studentId": "{{studentId}}",
  "title": "Academic Excellence Award",
  "description": "Achieved highest GPA in the semester",
  "imageUrl": "https://via.placeholder.com/400x300"
}

### 2. Get Student Achievements
GET {{baseUrl}}/achievements/student/{{studentId}}
Authorization: Bearer {{token}}

### 3. Get Pending Achievements (Admin Only)
GET {{baseUrl}}/achievements/pending
Authorization: Bearer {{token}}

### 4. Approve Achievement (Admin Only)
PUT {{baseUrl}}/achievements/ACHIEVEMENT_ID_HERE/approve
Authorization: Bearer {{token}}

### 5. Reject Achievement (Admin Only)
PUT {{baseUrl}}/achievements/ACHIEVEMENT_ID_HERE/reject
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "reason": "Does not meet achievement criteria"
}

### 6. Delete Achievement (Admin Only)
DELETE {{baseUrl}}/achievements/ACHIEVEMENT_ID_HERE
Authorization: Bearer {{token}}
```

---

## 🐛 Troubleshooting

### Issue: "Failed to load achievements"

**Check:**
1. Backend server running? → `http://localhost:5000`
2. MongoDB connected?
3. Check browser console for errors
4. Verify token in localStorage

**Fix:**
```javascript
// In browser console
localStorage.getItem('token') // Should return JWT token
```

---

### Issue: "Achievement Approvals page blank"

**Check:**
1. Logged in as admin? (role=admin)
2. Are there any pending achievements?
3. Network tab shows 401 Unauthorized? → Re-login

**Debug:**
```javascript
// Check user role in browser console
JSON.parse(localStorage.getItem('user')).role // Should be 'admin'
```

---

### Issue: Dialog doesn't open

**Check:**
1. MatDialog imported in component?
2. Browser console errors?
3. Module imports correct?

**Fix:**
- Verify `MatDialog` in constructor
- Check `AchievementDialogComponent` import path

---

### Issue: Images not displaying

**Check:**
1. Image URL valid and accessible?
2. CORS policy blocking?
3. Network tab shows 404?

**Fix:**
- Use placeholder service: `https://via.placeholder.com/400x300`
- Or leave blank to use default trophy SVG

---

## 📊 Expected Database State

### After Creating Achievement (Pending)

```javascript
{
  _id: ObjectId("..."),
  studentId: ObjectId("..."),
  title: "First Place in Science Fair",
  description: "Won first place in...",
  imageUrl: "https://...",
  status: "pending",
  createdBy: ObjectId("student_user_id"),
  approvedBy: null,
  approvalDate: null,
  createdAt: ISODate("2025-10-25T..."),
  updatedAt: ISODate("2025-10-25T...")
}
```

### After Approval

```javascript
{
  _id: ObjectId("..."),
  studentId: ObjectId("..."),
  title: "First Place in Science Fair",
  description: "Won first place in...",
  imageUrl: "https://...",
  status: "approved",          // ← Changed
  createdBy: ObjectId("student_user_id"),
  approvedBy: ObjectId("admin_user_id"),  // ← Added
  approvalDate: ISODate("2025-10-25T..."), // ← Added
  rejectedBy: null,
  rejectionDate: null,
  rejectionReason: null,
  createdAt: ISODate("2025-10-25T..."),
  updatedAt: ISODate("2025-10-25T...")      // ← Updated
}
```

---

## ✅ Final Checklist

Before marking feature complete, verify:

**Backend:**
- [ ] Achievement model exists in `backend/models/Achievement.js`
- [ ] Controller has 7 methods in `backend/controllers/achievementController.js`
- [ ] Routes mounted in `backend/server.js` (line 96)
- [ ] Authentication middleware on all routes
- [ ] Admin middleware on approve/reject/delete

**Frontend:**
- [ ] Achievement model interface in `frontend/src/app/models/achievement.model.ts`
- [ ] SharedService has 7 achievement methods
- [ ] Student detail component has achievements tab
- [ ] Achievement dialog component created
- [ ] Achievement approvals component created
- [ ] Routes configured in `app.routes.ts`
- [ ] Dashboard quick action added

**UI/UX:**
- [ ] Responsive grid layouts
- [ ] Hover animations work
- [ ] Loading spinners show
- [ ] Empty states display
- [ ] Confirmation dialogs appear
- [ ] Success/error notifications work
- [ ] Default trophy image loads

**Testing:**
- [ ] Create achievement as student
- [ ] View pending as admin
- [ ] Approve achievement
- [ ] Verify visible to student
- [ ] Reject achievement
- [ ] Verify NOT visible to student
- [ ] Delete achievement
- [ ] Test with/without image URLs

---

## 🎉 Success Criteria

**Feature is complete when:**
✅ Students can create achievements
✅ Achievements start as "pending" status
✅ Admins see pending achievements in approval page
✅ Admins can approve/reject with one click
✅ Approved achievements appear in student profile
✅ Rejected achievements are hidden
✅ All CRUD operations work
✅ Access control enforced
✅ UI is responsive and polished
✅ Default image fallback works

---

## 🚀 Next: Start Testing!

1. **Update Node.js** to v20.19+ or v22.12+
2. **Start backend:** `cd backend && node server.js`
3. **Start frontend:** `cd frontend && npx ng serve`
4. **Open browser:** `http://localhost:4200`
5. **Follow test scenarios** above

**Happy Testing! 🎊**
