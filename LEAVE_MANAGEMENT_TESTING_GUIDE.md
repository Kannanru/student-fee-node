# Leave Management Module - Testing Guide

## Prerequisites
✅ Backend server running on `http://localhost:5000`
✅ MongoDB connected and running
✅ Sample student data in database

## Testing Checklist

### 1. Backend API Tests (Using Postman/Thunder Client/curl)

#### Test 1: Apply Leave for Student
```http
POST http://localhost:5000/api/leave/apply
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "studentId": "STU001",
  "startDate": "2025-10-25",
  "endDate": "2025-10-27",
  "reason": "Medical checkup and recovery",
  "leaveType": "Medical",
  "remarks": "Doctor's appointment scheduled"
}
```

**Expected Response (201 Created)**:
```json
{
  "success": true,
  "message": "Leave application submitted successfully",
  "leave": {
    "_id": "...",
    "studentId": "STU001",
    "status": "pending",
    "numberOfDays": 3,
    ...
  }
}
```

**Validation Tests**:
- ❌ End date before start date → Should return 400 error
- ❌ Missing required fields → Should return 400 error
- ❌ Overlapping leave dates → Should return 400 error

---

#### Test 2: Get All Leaves
```http
GET http://localhost:5000/api/leave
Authorization: Bearer <your_jwt_token>
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "count": 5,
  "leaves": [...]
}
```

**Filter Tests**:
```http
# Get pending leaves only
GET http://localhost:5000/api/leave?status=pending

# Get leaves for specific program
GET http://localhost:5000/api/leave?programName=MBBS&year=1

# Get leaves for date range
GET http://localhost:5000/api/leave?startDate=2025-10-20&endDate=2025-10-30
```

---

#### Test 3: Get Students on Leave (Critical for Real-time Attendance)
```http
GET http://localhost:5000/api/leave/on-leave?date=2025-10-25&programName=MBBS&year=1
Authorization: Bearer <your_jwt_token>
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "count": 2,
  "students": [
    {
      "studentId": "STU001",
      "studentName": "John Doe",
      "studentRegisterNumber": "MBBS2024001",
      "programName": "MBBS",
      "year": 1,
      "reason": "Medical checkup",
      "leaveType": "Medical",
      "startDate": "2025-10-25",
      "endDate": "2025-10-27"
    }
  ]
}
```

---

#### Test 4: Approve Leave
```http
PUT http://localhost:5000/api/leave/<leave_id>/approve
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "adminId": "ADMIN001",
  "adminName": "Dr. Smith"
}
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Leave approved successfully",
  "leave": {
    "status": "approved",
    "approvedBy": "ADMIN001",
    "approvedByName": "Dr. Smith",
    "approvalDate": "2025-10-23T..."
  }
}
```

**Validation Tests**:
- ❌ Approve already approved leave → Should return 400 error
- ❌ Approve without admin credentials → Should return 400 error

---

#### Test 5: Reject Leave
```http
PUT http://localhost:5000/api/leave/<leave_id>/reject
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "adminId": "ADMIN001",
  "adminName": "Dr. Smith",
  "reason": "Insufficient justification provided"
}
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Leave rejected successfully",
  "leave": {
    "status": "rejected",
    "approvedBy": "ADMIN001",
    "approvedByName": "Dr. Smith",
    "rejectionReason": "Insufficient justification provided"
  }
}
```

---

#### Test 6: Delete Pending Leave
```http
DELETE http://localhost:5000/api/leave/<leave_id>
Authorization: Bearer <your_jwt_token>
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "message": "Leave application deleted successfully"
}
```

**Validation Tests**:
- ❌ Delete approved leave → Should return 403 error
- ❌ Delete rejected leave → Should return 403 error

---

#### Test 7: Get Student's Leave History
```http
GET http://localhost:5000/api/leave/student/<student_id>
Authorization: Bearer <your_jwt_token>
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "count": 3,
  "leaves": [...]
}
```

---

#### Test 8: Get Leave Statistics
```http
GET http://localhost:5000/api/leave/stats
Authorization: Bearer <your_jwt_token>
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "stats": {
    "total": 15,
    "pending": 5,
    "approved": 8,
    "rejected": 2
  }
}
```

---

### 2. Frontend UI Tests

#### Test 1: Navigation Menu
- [x] Navigate to dashboard
- [x] Click "Leave Management" button
- [x] Should redirect to `/leave/management`
- [x] Should show Leave Management component

#### Test 2: Apply Leave Form
- [x] Click "Select Student" dropdown
- [x] Type student name in search box
- [x] Select student from filtered results
- [x] Choose leave type (Medical/Personal/Emergency/Other)
- [x] Select start date
- [x] Select end date (should be >= start date)
- [x] Days should auto-calculate
- [x] Enter reason (required)
- [x] Enter optional remarks
- [x] Click "Submit Leave Application"
- [x] Should show success message
- [x] Form should reset
- [x] Leave should appear in table below

**Validation Tests**:
- ❌ Submit without student → Should show error
- ❌ Submit without dates → Should show error
- ❌ Submit without reason → Should show error
- ❌ End date before start date → Should show error

#### Test 3: Leave Requests Table
- [x] Should display all leave requests
- [x] Should show: student name, dates, days, reason, status
- [x] Status badges should have correct colors:
  - Pending → Orange
  - Approved → Green
  - Rejected → Red
- [x] Should show approved by name for approved leaves
- [x] Should show rejection reason for rejected leaves

#### Test 4: Filter Leave Requests
- [x] Click "Pending" button → Should show only pending leaves
- [x] Click "Approved" button → Should show only approved leaves
- [x] Click "Rejected" button → Should show only rejected leaves
- [x] Click "All" button → Should show all leaves
- [x] Click refresh button → Should reload all leaves

#### Test 5: Approve Leave
- [x] Find pending leave in table
- [x] Click green checkmark button
- [x] Should show confirmation dialog
- [x] Confirm approval
- [x] Status should change to "Approved"
- [x] Approved by name should appear
- [x] Action buttons should disappear
- [x] Should show success message

#### Test 6: Reject Leave
- [x] Find pending leave in table
- [x] Click red X button
- [x] Should prompt for rejection reason
- [x] Enter reason
- [x] Status should change to "Rejected"
- [x] Rejection reason should appear
- [x] Action buttons should disappear
- [x] Should show success message

#### Test 7: Delete Leave
- [x] Find pending leave in table
- [x] Click delete button
- [x] Should show confirmation dialog
- [x] Confirm deletion
- [x] Leave should be removed from table
- [x] Should show success message

**Validation Tests**:
- ❌ Approve button should not appear for approved leaves
- ❌ Delete button should not appear for approved/rejected leaves

---

### 3. Student Detail View Integration Tests

#### Test 1: Navigate to Student Detail
- [x] Go to Students list
- [x] Click on any student
- [x] Should open student detail page
- [x] Should see tabs: Personal Info, Academic Info, Guardian Info, Fee Records, **Leave Records**

#### Test 2: Leave Records Tab
- [x] Click "Leave Records" tab
- [x] Should load student's leave history
- [x] Should show table with columns:
  - Leave Period (start → end dates)
  - Days
  - Type
  - Reason (with remarks if any)
  - Status (with badge)
  - Action By (approved/rejected by name)
- [x] Should show empty state if no leaves
- [x] Should show loading spinner while fetching

#### Test 3: Leave Status Display
- [x] Pending leaves → Orange badge with pending icon
- [x] Approved leaves → Green badge with check icon + Approved by name + Approval date
- [x] Rejected leaves → Red badge with cancel icon + Rejection reason

---

### 4. Real-time Attendance Dashboard Integration Tests

#### Test 1: Load Dashboard
- [x] Navigate to Real-time Attendance Dashboard
- [x] Select Program (e.g., MBBS)
- [x] Select Year (e.g., Year 1)
- [x] Click "Load Class"
- [x] Should load all students

#### Test 2: Leave Count Card
- [x] Should see 5 stat cards:
  - Total Students
  - Present (In)
  - Absent
  - Pending
  - **On Leave** ← New card
- [x] "On Leave" card should show count of students on leave today
- [x] Card should have orange border and event_busy icon

#### Test 3: Leave Status in Student Table
- [x] Students on leave should show "Leave" status badge (orange)
- [x] Leave icon (event_busy) should appear
- [x] Leave reason should appear below status chip
- [x] Leave students should not be marked as "Absent" or "Pending"

#### Test 4: Leave API Integration
- [x] Should call `/api/leave/on-leave?date=TODAY&programName=X&year=Y`
- [x] Should automatically mark students as "Leave" status
- [x] Should update stats to show leave count
- [x] Should show notification: "X student(s) on leave today"

#### Test 5: Multiple Status Handling
- [x] Student on leave → Should NOT change to Pending
- [x] Student on leave → Should NOT change to Absent
- [x] Student on leave who scans card → Status remains "Leave"
- [x] Leave status takes priority over attendance

---

### 5. Integration Workflow Tests

#### Scenario 1: Complete Leave Workflow
1. **Apply Leave**: Admin applies leave for student (Oct 25-27)
2. **Verify Pending**: Leave appears as pending in Leave Management table
3. **Approve Leave**: Admin approves the leave
4. **Check Student Detail**: Navigate to student detail → Leave Records tab → See approved leave
5. **Check Real-time Dashboard**: On Oct 25, load real-time dashboard → Student shows "Leave" status

#### Scenario 2: Overlapping Leave Prevention
1. Apply leave for student: Oct 25-27
2. Try to apply another leave: Oct 26-28 (overlaps)
3. Should return error: "Student already has leave during this period"

#### Scenario 3: Leave Rejection Flow
1. Apply leave for student
2. Reject with reason: "Exam scheduled during leave period"
3. Check student detail → Should show rejection reason
4. Check real-time dashboard → Student should NOT show as "Leave"

#### Scenario 4: Multi-Student Leave
1. Apply leave for 3 students on same date
2. Load real-time dashboard for that class
3. "On Leave" card should show 3
4. All 3 students should have "Leave" status in table

---

## Test Results Summary

### Backend API Tests
- [ ] Apply leave (POST /api/leave/apply)
- [ ] Get all leaves (GET /api/leave)
- [ ] Get filtered leaves (with query params)
- [ ] Get students on leave (GET /api/leave/on-leave)
- [ ] Approve leave (PUT /api/leave/:id/approve)
- [ ] Reject leave (PUT /api/leave/:id/reject)
- [ ] Delete leave (DELETE /api/leave/:id)
- [ ] Get student leaves (GET /api/leave/student/:id)
- [ ] Get leave stats (GET /api/leave/stats)

### Frontend UI Tests
- [ ] Navigation menu shows "Leave Management"
- [ ] Leave Management component loads
- [ ] Apply leave form works
- [ ] Student search/filter works
- [ ] Form validation works
- [ ] Leave table displays correctly
- [ ] Status filtering works
- [ ] Approve leave works
- [ ] Reject leave with reason works
- [ ] Delete pending leave works

### Student Detail Integration
- [ ] Leave Records tab appears
- [ ] Leave history loads correctly
- [ ] Status badges display correctly
- [ ] Approved by/rejection info shows

### Real-time Dashboard Integration
- [ ] "On Leave" card displays
- [ ] Leave count updates correctly
- [ ] Leave status shows in student table
- [ ] Leave reason tooltip displays
- [ ] API call to /on-leave works

### Integration Workflows
- [ ] Complete leave workflow (apply → approve → display)
- [ ] Overlapping leave prevention
- [ ] Leave rejection flow
- [ ] Multi-student leave handling

---

## Common Issues & Solutions

### Issue 1: Leave not showing in real-time dashboard
**Solution**: Check if:
- Leave is approved (only approved leaves show)
- Leave date matches today's date
- Program and year match the selected class
- API call to `/api/leave/on-leave` is successful

### Issue 2: Cannot approve leave
**Solution**: Check if:
- Leave status is "pending"
- Admin credentials (adminId, adminName) are provided
- JWT token is valid

### Issue 3: Student search not working
**Solution**: Check if:
- Students are loaded in component
- Search input is triggering filter function
- Student names/IDs match search term

### Issue 4: Leave Records tab empty
**Solution**: Check if:
- API call to `/api/leave/student/:id` is successful
- Student has any leave records in database
- Student ID is correct

---

## Manual Testing Procedure

### 1. Backend Tests (15 minutes)
1. Open Postman/Thunder Client
2. Test all 9 API endpoints listed above
3. Verify response codes and data structure
4. Test validation errors (invalid dates, missing fields)
5. Test status workflow (pending → approved/rejected)

### 2. Frontend Tests (20 minutes)
1. Login to application as admin
2. Navigate to Leave Management
3. Apply leave for 2-3 students
4. Test all filter buttons
5. Approve 1 leave, reject 1 leave, delete 1 pending leave
6. Navigate to student detail → Check Leave Records tab
7. Navigate to Real-time Attendance → Check "On Leave" card

### 3. Integration Tests (10 minutes)
1. Apply leave for student for today's date
2. Approve the leave
3. Navigate to real-time attendance dashboard
4. Select same program/year as student
5. Verify student shows as "Leave" status
6. Verify "On Leave" count is correct

**Total Testing Time**: ~45 minutes

---

## Automated Test Script (Future)

```javascript
// Example Jest/Jasmine test
describe('Leave Management Module', () => {
  it('should apply leave successfully', async () => {
    const response = await request(app)
      .post('/api/leave/apply')
      .send({
        studentId: 'STU001',
        startDate: '2025-10-25',
        endDate: '2025-10-27',
        reason: 'Medical',
        leaveType: 'Medical'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.leave.status).toBe('pending');
  });
  
  // Add more automated tests...
});
```

---

## Success Criteria

✅ **Module Complete** when:
1. All backend APIs return correct responses
2. Frontend UI functional and displays data correctly
3. Student detail view shows leave history
4. Real-time dashboard displays leave count and status
5. Complete workflow (apply → approve → display) works end-to-end
6. No console errors or API failures
7. Responsive design works on mobile/tablet
8. All validation rules enforced

---

**Testing Status**: Ready to begin
**Last Updated**: October 23, 2025
