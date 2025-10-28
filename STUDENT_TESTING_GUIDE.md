# Student Module - Testing Guide

## Quick Start Testing

### Backend Testing

1. **Start Backend Server**:
   ```powershell
   cd c:\Attendance\MGC\backend
   npm start
   ```

2. **Run Automated Tests**:
   ```powershell
   cd c:\Attendance\MGC\backend
   node scripts/test_student_crud.js
   ```

   This will test:
   - ✅ Admin login
   - ✅ Student creation (23 required fields)
   - ✅ List students (with pagination)
   - ✅ Search students
   - ✅ Get student by ID
   - ✅ Update student
   - ✅ Filter by program
   - ✅ Get student fees
   - ✅ Delete student
   - ✅ Verify deletion

### Frontend Testing

1. **Start Frontend Dev Server**:
   ```powershell
   cd c:\Attendance\MGC\frontend
   ng serve
   ```

2. **Open Browser**: http://localhost:4200

3. **Test Student Creation**:
   - Navigate to `/students/new`
   - Fill all required fields:
     - **Step 1 - Basic Information**:
       - First Name, Last Name
       - Student ID, Enrollment Number
       - Email, Contact Number
       - Date of Birth, Gender, Blood Group
       - Permanent Address
       - Password (for new students only)
     - **Step 2 - Academic Details**:
       - Program Name (BDS, MBBS, etc.)
       - Academic Year (2024-2029)
       - Semester (1-10)
       - Student Type (Regular, Scholarship, Merit, Reserved)
       - Status (Active, Inactive, etc.)
       - Admission Date
     - **Step 3 - Guardian & Emergency**:
       - Guardian Name, Guardian Contact
       - Emergency Contact Name, Emergency Contact Number
     - **Step 4 - Parent Details (Optional)**:
       - Father's Name, Occupation, Phone
       - Mother's Name, Occupation, Phone
       - Parent Email
   - Click "Add Student"
   - Verify success notification

4. **Test Student List**:
   - Navigate to `/students`
   - Verify students display with:
     - Full name (firstName + lastName)
     - Student ID and Semester
     - Program Name and Academic Year
     - Enrollment Number
     - Guardian Name
   - Test search functionality
   - Test filters (Program, Status)

5. **Test Student Update**:
   - Click edit on any student
   - Verify all fields populate correctly
   - Update some fields (e.g., semester, contact number)
   - **Do NOT change password** (should remain optional)
   - Click "Update Student"
   - Verify changes persist

6. **Test Student Delete**:
   - Click delete on a student
   - Verify confirmation shows full name
   - Confirm deletion
   - Verify student removed from list

## Manual API Testing with Postman/REST Client

### 1. Create Student
```http
POST http://localhost:5000/api/students
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "studentId": "STU001234",
  "enrollmentNumber": "ENR2024001234",
  "firstName": "John",
  "lastName": "Doe",
  "dob": "2005-01-15",
  "gender": "Male",
  "email": "john.doe@example.com",
  "contactNumber": "9876543210",
  "permanentAddress": "123 Main Street, City, State - 123456",
  "programName": "BDS",
  "academicYear": "2024-2029",
  "semester": 1,
  "admissionDate": "2024-08-01",
  "guardianName": "Jane Doe",
  "guardianContact": "9876543211",
  "emergencyContactName": "Emergency Contact",
  "emergencyContactNumber": "9876543212",
  "studentType": "full-time",
  "password": "Test@123",
  "bloodGroup": "O+",
  "status": "active"
}
```

### 2. List Students (with filters)
```http
GET http://localhost:5000/api/students?page=1&limit=10&programName=BDS&semester=1
Authorization: Bearer <admin_token>
```

### 3. Search Students
```http
GET http://localhost:5000/api/students?search=John
Authorization: Bearer <admin_token>
```

### 4. Get Student by ID
```http
GET http://localhost:5000/api/students/profile/<student_id>
Authorization: Bearer <admin_token>
```

### 5. Update Student
```http
PUT http://localhost:5000/api/students/<student_id>
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "John Updated",
  "semester": 2,
  "contactNumber": "9876543219"
}
```

### 6. Delete Student
```http
DELETE http://localhost:5000/api/students/<student_id>
Authorization: Bearer <admin_token>
```

### 7. Get Student Fees
```http
GET http://localhost:5000/api/students/<student_id>/fees
Authorization: Bearer <admin_token>
```

## Expected Results

### Success Responses

**Create Student (201)**:
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "studentId": "STU001234",
    "enrollmentNumber": "ENR2024001234",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "contactNumber": "9876543210",
    "programName": "BDS",
    "semester": 1,
    "status": "active"
    // ... other fields (password excluded)
  }
}
```

**List Students (200)**:
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": [ /* array of students */ ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalStudents": 45
  }
}
```

**Update Student (200)**:
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": { /* updated student object */ }
}
```

**Delete Student (200)**:
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

### Error Responses

**Missing Required Fields (400)**:
```json
{
  "success": false,
  "message": "Missing required fields",
  "fields": ["enrollmentNumber", "guardianName", "guardianContact"]
}
```

**Duplicate Email (409)**:
```json
{
  "success": false,
  "message": "Student already exists with same email/studentId/enrollmentNumber"
}
```

**Student Not Found (404)**:
```json
{
  "success": false,
  "message": "Student not found"
}
```

**Validation Error (400)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "contactNumber": "Contact number must be a valid 10-digit Indian mobile number",
    "email": "Please enter a valid email address"
  }
}
```

## Common Issues & Solutions

### Issue 1: "Missing required fields"
**Cause**: Not all 23 required fields provided
**Solution**: Ensure all fields from test data are present:
- studentId, enrollmentNumber, firstName, lastName, dob, gender
- email, contactNumber, permanentAddress
- programName, academicYear, semester, admissionDate
- guardianName, guardianContact
- emergencyContactName, emergencyContactNumber
- studentType, password, status

### Issue 2: "Contact number must be a valid 10-digit Indian mobile number"
**Cause**: Invalid phone number format
**Solution**: Use format `9876543210` (10 digits starting with 6-9)

### Issue 3: "Email already exists"
**Cause**: Duplicate email in database
**Solution**: Use unique email or delete existing student

### Issue 4: "Date of birth must be valid and age should be between 16-35 years"
**Cause**: Invalid date or age out of range
**Solution**: Use date that makes student 16-35 years old (e.g., `2005-01-15`)

### Issue 5: Frontend form not showing all fields
**Cause**: Browser cache or compile error
**Solution**: 
1. Hard refresh browser (Ctrl+Shift+R)
2. Check console for errors
3. Restart ng serve

### Issue 6: "Property 'programName' does not exist"
**Cause**: Old Student interface cached
**Solution**: 
1. Stop ng serve
2. Delete `frontend/dist` and `frontend/.angular` folders
3. Run `ng serve` again

## Validation Rules Reference

| Field | Type | Min | Max | Pattern | Required |
|-------|------|-----|-----|---------|----------|
| firstName | String | 2 | 50 | Letters only | ✅ |
| lastName | String | 2 | 50 | Letters only | ✅ |
| studentId | String | - | - | STU001234 format | ✅ |
| enrollmentNumber | String | - | - | Any unique | ✅ |
| email | String | - | - | Valid email | ✅ |
| contactNumber | String | 10 | 10 | 10-digit mobile | ✅ |
| dob | Date | 16y | 35y | Valid date | ✅ |
| gender | Enum | - | - | Male/Female/Other | ✅ |
| permanentAddress | String | 10 | 500 | Any | ✅ |
| programName | Enum | - | - | BDS/MBBS/etc | ✅ |
| academicYear | String | - | - | 2024-2029 format | ✅ |
| semester | Number | 1 | 10 | Integer | ✅ |
| admissionDate | Date | - | Today | Cannot be future | ✅ |
| guardianName | String | 2 | - | Letters only | ✅ |
| guardianContact | String | 10 | 10 | 10-digit mobile | ✅ |
| emergencyContactName | String | - | - | Letters only | ✅ |
| emergencyContactNumber | String | 10 | 10 | 10-digit mobile | ✅ |
| studentType | Enum | - | - | full-time/part-time | ✅ |
| password | String | 6 | - | 1 upper, 1 lower, 1 digit | ✅ (create only) |
| bloodGroup | String | - | - | A+/A-/B+/B-/O+/O-/AB+/AB- | ❌ |
| status | Enum | - | - | active/inactive | ✅ |

## Success Criteria Checklist

### Backend (API)
- [ ] POST /students creates student with all 23 fields
- [ ] POST /students validates required fields
- [ ] POST /students prevents duplicate email/studentId/enrollmentNumber
- [ ] GET /students returns paginated list
- [ ] GET /students?search=John filters by firstName/lastName/studentId/enrollmentNumber
- [ ] GET /students?programName=BDS filters by program
- [ ] GET /students/profile/:id returns single student
- [ ] PUT /students/:id updates student
- [ ] PUT /students/:id handles password update correctly
- [ ] DELETE /students/:id removes student
- [ ] GET /students/:id/fees returns fee details

### Frontend (UI)
- [ ] Student form displays all 23 required fields
- [ ] Form validation shows correct error messages
- [ ] Student creation submits correct payload
- [ ] Student list displays firstName + lastName combined
- [ ] Student list shows enrollmentNumber, programName, semester
- [ ] Student edit loads all existing data correctly
- [ ] Student update preserves data when password not changed
- [ ] Student delete shows confirmation with correct name
- [ ] Search filters work with new field names
- [ ] Responsive layout works on mobile

### Integration
- [ ] Create student via UI → Appears in database
- [ ] Update student via UI → Changes persist
- [ ] Delete student via UI → Removed from database
- [ ] Student login → JWT token generated
- [ ] Navigate to fees → Fee details load correctly

## Next Steps After Testing

1. **If all tests pass**: Move to Employee module creation
2. **If tests fail**: Document specific errors and fix
3. **Integration testing**: Test student → attendance → fees workflow
4. **Performance testing**: Test with 100+ students
5. **Security testing**: Verify JWT auth, input sanitization

## Support & Documentation

- **Backend API Docs**: `backend/API_Documentation.md`
- **Student Module Fixes**: `STUDENT_MODULE_FIXES.md`
- **API Integration**: `API_INTEGRATION_COMPLETE.md`
- **Postman Collection**: `backend/docs/postman_collection.json`
- **REST Client**: `backend/requests.http`
