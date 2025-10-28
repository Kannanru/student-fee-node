# Bulk Fee Upload Feature - Complete Guide

## Overview
The Bulk Fee Upload feature allows administrators to upload student fee payment details in bulk using an Excel file. The system automatically processes the data, creates/updates fee records, and generates payment receipts.

## Features Implemented

### Backend (`/backend`)
1. **Excel Parsing Controller** (`controllers/bulkUploadController.js`)
   - Parses Excel files (.xlsx, .xls)
   - Validates data consistency
   - Matches students and fee structures
   - Creates bills and payment records
   - Returns detailed processing summary

2. **API Routes** (`routes/bulkUpload.js`)
   - `POST /api/bulk-upload/fees` - Upload Excel file
   - `GET /api/bulk-upload/template` - Download template

3. **Dependencies Added**
   - `xlsx` - Excel file parsing
   - `multer` - File upload handling

### Frontend (`/frontend`)
1. **Bulk Upload Component** (`components/fees/bulk-fee-upload`)
   - File selection and upload UI
   - Academic year selection
   - Real-time upload progress
   - Detailed results table
   - Summary statistics dashboard
   - Export results to CSV

2. **Route**
   - `/fees/bulk-upload` - Main upload interface

## Excel File Format

### Required Columns
| Column Name | Description | Format | Required |
|------------|-------------|--------|----------|
| Student ID | Student identifier | Text (e.g., STU001234, EN2024BDS030) | Yes |
| Fee Year | Academic year | Number or Text (1, 2, "1st Year", "2nd Year") | Yes |
| Payment Status | Payment status | "Paid" or "Not Paid" | Yes |

### Sample Data
```
Student ID    | Fee Year  | Payment Status
--------------|-----------|---------------
STU001234     | 1         | Paid
BDS000030     | 1st Year  | Not Paid
EN2024BDS030  | 2         | Paid
```

## How It Works

### Upload Process Flow
1. **File Upload**
   - Admin selects Excel file and academic year
   - File is validated (type, size)
   - Uploaded to backend

2. **Data Processing**
   ```
   For each row:
   ├── Validate required fields
   ├── Find student by ID/enrollment/register number
   ├── Match fee plan (program, year, quota, academic year)
   ├── Create or retrieve student bill
   └── If "Paid":
       ├── Create payment record
       ├── Generate receipt number
       ├── Mark all fee heads as paid
       └── Update bill status to "paid"
   ```

3. **Summary Generation**
   - Total rows processed
   - Successful vs failed operations
   - Already paid records
   - Invalid rows
   - Detailed row-by-row results

### Student Matching
System searches for students using multiple identifiers:
- `studentId` field
- `enrollmentNumber` field
- `registerNumber` field

### Fee Plan Matching
Automatically finds the appropriate fee plan based on:
- Student's program (MBBS, BDS, etc.)
- Fee year from Excel
- Student's quota (puducherry-ut, all-india, nri, self-sustaining)
- Academic year (from input)
- Active status
- Latest version (if multiple exist)

### Bill Creation
- Generates unique bill number (e.g., BILL-2025-00123)
- Copies all fee heads from matched plan
- Sets due date (default 30 days)
- Status: 'pending'

### Payment Creation (if "Paid")
- Generates unique receipt number (e.g., RCP-2025-00123)
- Payment mode: 'bulk-upload'
- Status: 'confirmed'
- Links to bill
- Records all fee heads
- Updates bill to 'paid' status

## Validation Rules

### Row-Level Validation
- **Student ID**: Must not be empty
- **Fee Year**: Must contain a valid number (1-10)
- **Payment Status**: Must be "Paid" or "Not Paid" (case-insensitive)

### Business Logic Validation
- Student must exist in database
- Fee plan must exist for student's program and year
- Duplicate processing handled (already paid records)

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Bulk upload completed",
  "results": {
    "total": 7,
    "valid": 7,
    "invalid": 0,
    "processed": 7,
    "successful": 5,
    "failed": 2,
    "alreadyPaid": 1,
    "details": [
      {
        "rowNumber": 2,
        "success": true,
        "studentId": "STU001234",
        "year": 1,
        "status": "Paid",
        "message": "Successfully marked as paid",
        "billNumber": "BILL-2025-00124",
        "receiptNumber": "RCP-2025-00125"
      },
      // ... more rows
    ]
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## Usage Guide

### For Administrators

#### Step 1: Download Template
1. Navigate to **Fees** → **Bulk Upload**
2. Click "Download Template" button
3. Template downloads as `fee_upload_template.xlsx`

#### Step 2: Fill Data
1. Open template in Excel
2. Fill in student data:
   - Student ID (exact match required)
   - Fee Year (1, 2, 3, etc. or "1st Year", "2nd Year")
   - Payment Status ("Paid" or "Not Paid")
3. Save file

#### Step 3: Upload
1. Select academic year (e.g., "2024-2025")
2. Choose your filled Excel file
3. Click "Upload File"
4. Wait for processing (shows progress)

#### Step 4: Review Results
- View summary statistics
- Check detailed results table
- Export results to CSV if needed
- Upload another file or return to dashboard

### Best Practices
1. **Verify Student IDs**: Ensure all student IDs exist in the system
2. **Consistent Format**: Use the same ID type (studentId, enrollment, or register number)
3. **Small Batches**: For first-time use, test with 5-10 records
4. **Review Results**: Always check the detailed results for any failures
5. **Backup**: Keep original Excel files for reference

## Testing

### Backend Testing
```bash
cd backend

# Generate sample Excel file
node scripts/generate_sample_excel.js
# Creates: backend/public/templates/sample_fee_upload.xlsx

# Start server
npm run dev
```

### API Testing (with curl/Postman)
```bash
# Download template
GET http://localhost:5000/api/bulk-upload/template
Authorization: Bearer <token>

# Upload file
POST http://localhost:5000/api/bulk-upload/fees
Authorization: Bearer <token>
Content-Type: multipart/form-data
Body:
  - file: <excel file>
  - academicYear: "2024-2025"
```

### Frontend Testing
1. Start Angular dev server: `ng serve`
2. Login as admin
3. Navigate to `/fees/bulk-upload`
4. Use sample file from `backend/public/templates/sample_fee_upload.xlsx`
5. Test upload and review results

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Student not found" | Student ID doesn't exist | Verify ID matches database |
| "No fee plan found" | No matching fee structure | Create fee plan for program/year |
| "Validation errors" | Invalid data format | Check column format requirements |
| "File size exceeds limit" | File > 5MB | Reduce file size or split data |
| "Only Excel files allowed" | Wrong file type | Use .xlsx or .xls format |

### Error Recovery
- Invalid rows are skipped, valid rows still process
- Detailed error messages for each failed row
- Export results to CSV for tracking
- Can re-upload corrected data

## Database Impact

### Records Created
1. **StudentBill** - One per student per year
2. **Payment** - One per paid status
3. **Updated**: Student bill status, payment tracking

### Data Consistency
- Atomic operations per row
- Already paid records not duplicated
- Audit trail maintained

## Security

### Authentication
- All endpoints require JWT token
- Admin role recommended (enforced by FeesGuard)

### File Upload Security
- File type validation (Excel only)
- File size limit (5MB)
- Memory storage (no disk writes)
- Malicious content checked by xlsx library

## Performance

### Limits
- File size: 5MB maximum
- Recommended batch: 100-500 rows
- Processing time: ~0.5-1 second per row

### Optimization
- Batch database queries where possible
- Transactions for data integrity
- Progress indication for user feedback

## Future Enhancements

### Potential Features
1. ✅ Email notifications on completion
2. ✅ Background job processing for large files
3. ✅ Multiple payment installments support
4. ✅ Fine calculation from Excel data
5. ✅ Custom field mapping
6. ✅ Duplicate detection before processing
7. ✅ Rollback capability for errors

## Troubleshooting

### File Upload Fails
- Check file format (.xlsx or .xls)
- Verify file size < 5MB
- Ensure network connection
- Check authentication token

### Processing Errors
- Review validation messages in results
- Check student IDs match exactly
- Verify fee plans exist
- Confirm academic year format

### Results Not Showing
- Wait for processing to complete
- Check browser console for errors
- Refresh page and try again
- Verify backend server is running

## Support

### Log Files
Backend logs show detailed processing:
```
=== Bulk Fee Upload Started ===
Academic Year: 2024-2025
Uploaded by: Admin User (id)
Parsed 7 rows from Excel
Valid rows: 7
Invalid rows: 0
...
=== Upload Summary ===
Total rows: 7
Successful: 5
Failed: 2
Already Paid: 1
```

### Contact
For issues or questions:
- Check logs in backend console
- Review detailed results table
- Export results for analysis
- Contact system administrator

## API Documentation

### POST /api/bulk-upload/fees
Upload Excel file with student fee data

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body:**
- `file`: Excel file (.xlsx or .xls)
- `academicYear`: Academic year string (e.g., "2024-2025")

**Response:** See "Response Format" section above

### GET /api/bulk-upload/template
Download Excel template file

**Headers:**
- `Authorization: Bearer <token>`

**Response:** Excel file download

---

## Quick Start

1. **Download template**: Click "Download Template" in UI
2. **Fill data**: Add student IDs, years, and payment statuses
3. **Upload**: Select academic year and upload file
4. **Review**: Check summary and detailed results
5. **Done**: Bills and payments automatically created!
