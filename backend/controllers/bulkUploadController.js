/**
 * Bulk Fee Upload Controller
 * 
 * Handles bulk upload of student fee payment details via Excel
 * - Parses Excel file with columns: Student ID, Fee Year, Payment Status
 * - Validates data and matches fee structures
 * - Creates/updates fee records and payments
 * - Returns detailed summary report
 */

const XLSX = require('xlsx');
const mongoose = require('mongoose');
const Student = require('../models/Student');
const FeePlan = require('../models/FeePlan');
const StudentBill = require('../models/StudentBill');
const Payment = require('../models/Payment');
const FeeHead = require('../models/FeeHead');

/**
 * Parse Excel file and extract student fee data
 */
const parseExcelFile = (fileBuffer) => {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header mapping
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      raw: false,
      defval: ''
    });
    
    return data;
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

/**
 * Validate row data
 */
const validateRow = (row, index) => {
  const errors = [];
  
  // Required fields
  if (!row['Student ID'] && !row['student_id'] && !row['studentId']) {
    errors.push('Student ID is required');
  }
  
  if (!row['Fee Year'] && !row['fee_year'] && !row['year']) {
    errors.push('Fee Year is required');
  }
  
  if (!row['Payment Status'] && !row['payment_status'] && !row['status']) {
    errors.push('Payment Status is required');
  }
  
  // Normalize field names
  const normalized = {
    studentId: row['Student ID'] || row['student_id'] || row['studentId'] || '',
    feeYear: row['Fee Year'] || row['fee_year'] || row['year'] || '',
    paymentStatus: row['Payment Status'] || row['payment_status'] || row['status'] || ''
  };
  
  // Validate fee year format (should be 1, 2, 3, 4, or "1st Year", "2nd Year", etc.)
  const yearMatch = normalized.feeYear.toString().match(/(\d+)/);
  if (!yearMatch) {
    errors.push('Invalid Fee Year format');
  } else {
    normalized.year = parseInt(yearMatch[1]);
  }
  
  // Validate payment status
  const status = normalized.paymentStatus.toLowerCase().trim();
  if (!['paid', 'not paid', 'unpaid', 'pending'].includes(status)) {
    errors.push('Payment Status must be "Paid" or "Not Paid"');
  }
  normalized.isPaid = status === 'paid';
  
  return {
    valid: errors.length === 0,
    errors,
    data: normalized,
    rowNumber: index + 2 // Excel row number (accounting for header)
  };
};

/**
 * Find matching fee plan for student
 */
const findFeePlan = async (student, year, academicYear) => {
  // Determine semester based on year (odd/even)
  const semester = (year * 2) - 1; // Year 1 = Semester 1, Year 2 = Semester 3, etc.
  
  const query = {
    program: student.programName,
    year: year,
    quota: student.quota || 'puducherry-ut',
    status: 'active'
  };
  
  if (academicYear) {
    query.academicYear = academicYear;
  }
  
  const plan = await FeePlan.findOne(query)
    .populate('heads.headId')
    .sort({ version: -1 }); // Get latest version
  
  return plan;
};

/**
 * Create bill for student based on fee plan
 */
const createStudentBill = async (student, plan, year, semester) => {
  // Check if bill already exists
  const existingBill = await StudentBill.findOne({
    studentId: student._id,
    planId: plan._id,
    year: year,
    semester: semester
  });
  
  if (existingBill) {
    return existingBill;
  }
  
  // Generate bill number
  const billNumber = await StudentBill.generateBillNumber();
  
  // Prepare fee heads from plan
  const heads = plan.heads.map(h => ({
    headId: h.headId._id,
    headCode: h.headId.code,
    headName: h.headId.name,
    amount: h.amount || 0,
    amountUSD: h.amountUSD || 0,
    taxPercentage: h.taxPercentage || 0,
    taxAmount: h.taxAmount || 0,
    totalAmount: (h.amount || 0) + (h.taxAmount || 0),
    paidAmount: 0,
    balanceAmount: (h.amount || 0) + (h.taxAmount || 0)
  }));
  
  const totalAmount = heads.reduce((sum, h) => sum + h.totalAmount, 0);
  const totalAmountUSD = heads.reduce((sum, h) => sum + (h.amountUSD || 0), 0);
  
  // Set due date (default to 30 days from now)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  
  const bill = new StudentBill({
    billNumber,
    studentId: student._id,
    studentName: `${student.firstName} ${student.lastName}`,
    registerNumber: student.registerNumber || student.studentId,
    academicYear: plan.academicYear,
    program: student.programName,
    department: student.department || 'Not Specified',
    year,
    semester,
    quota: student.quota || 'puducherry-ut',
    planId: plan._id,
    planCode: plan.code,
    planVersion: plan.version,
    heads,
    totalAmount,
    totalAmountUSD,
    paidAmount: 0,
    balanceAmount: totalAmount,
    paidAmountUSD: 0,
    balanceAmountUSD: totalAmountUSD,
    dueDate,
    status: 'pending'
  });
  
  await bill.save();
  return bill;
};

/**
 * Mark bill as paid and create payment record
 */
const markBillAsPaid = async (bill, collectedBy) => {
  // Validate collectedBy
  if (!collectedBy) {
    throw new Error('Collector ID (collectedBy) is required');
  }
  
  console.log(`Creating payment for bill ${bill.billNumber}, collectedBy: ${collectedBy}`);
  
  // Generate receipt number
  const receiptNumber = await Payment.generateReceiptNumber();
  
  // Create payment record
  const payment = new Payment({
    receiptNumber,
    studentId: bill.studentId,
    studentName: bill.studentName,
    registerNumber: bill.registerNumber,
    billId: bill._id,
    billNumber: bill.billNumber,
    amount: bill.totalAmount,
    amountUSD: bill.totalAmountUSD || 0,
    currency: bill.totalAmountUSD > 0 ? 'USD' : 'INR',
    paymentMode: 'cash', // Using 'cash' as payment mode for bulk upload
    headsPaid: bill.heads.map(h => ({
      headId: h.headId,
      headCode: h.headCode,
      headName: h.headName,
      amount: h.totalAmount
    })),
    status: 'confirmed',
    paymentDate: new Date(),
    confirmedAt: new Date(),
    collectedBy: collectedBy, // Ensure this is set properly
    collectedByName: 'Bulk Upload System',
    collectionLocation: 'Bulk Upload',
    academicYear: bill.academicYear,
    semester: bill.semester,
    quota: bill.quota,
    receiptGenerated: false,
    remarks: 'Payment created via bulk Excel upload'
  });
  
  await payment.save();
  
  // Update bill status
  bill.paidAmount = bill.totalAmount;
  bill.paidAmountUSD = bill.totalAmountUSD;
  bill.balanceAmount = 0;
  bill.balanceAmountUSD = 0;
  bill.status = 'paid';
  bill.paidInFullDate = new Date();
  bill.lastPaymentDate = new Date();
  
  // Update each head as paid
  bill.heads.forEach(h => {
    h.paidAmount = h.totalAmount;
    h.balanceAmount = 0;
  });
  
  // Add payment to tracking
  bill.payments.push({
    paymentId: payment._id,
    receiptNumber: payment.receiptNumber,
    amount: payment.amount,
    amountUSD: payment.amountUSD,
    paymentDate: payment.paymentDate,
    paymentMode: payment.paymentMode
  });
  
  await bill.save();
  
  return payment;
};

/**
 * Process single row
 */
const processRow = async (rowData, collectedBy, academicYear) => {
  const result = {
    success: false,
    studentId: rowData.studentId,
    year: rowData.year,
    status: rowData.isPaid ? 'Paid' : 'Not Paid',
    message: '',
    billNumber: null,
    receiptNumber: null
  };
  
  try {
    // Find student
    const student = await Student.findOne({
      $or: [
        { studentId: rowData.studentId },
        { enrollmentNumber: rowData.studentId },
        { registerNumber: rowData.studentId }
      ]
    });
    
    if (!student) {
      result.message = `Student not found: ${rowData.studentId}`;
      return result;
    }
    
    // Find matching fee plan
    const plan = await findFeePlan(student, rowData.year, academicYear);
    
    if (!plan) {
      result.message = `No fee plan found for ${student.programName}, Year ${rowData.year}`;
      return result;
    }
    
    // Determine semester
    const semester = (rowData.year * 2) - 1;
    
    // Create or get bill
    const bill = await createStudentBill(student, plan, rowData.year, semester);
    result.billNumber = bill.billNumber;
    
    // If status is "Paid", mark as paid
    if (rowData.isPaid) {
      // Check if already paid
      if (bill.status === 'paid') {
        result.message = 'Already marked as paid';
        result.receiptNumber = bill.payments[0]?.receiptNumber;
      } else {
        const payment = await markBillAsPaid(bill, collectedBy);
        result.receiptNumber = payment.receiptNumber;
        result.message = 'Successfully marked as paid';
      }
    } else {
      result.message = 'Bill created/updated as pending';
    }
    
    result.success = true;
    
  } catch (error) {
    result.message = `Error: ${error.message}`;
  }
  
  return result;
};

/**
 * Main upload endpoint
 */
exports.bulkUploadFees = async (req, res, next) => {
  try {
    console.log('\n=== Bulk Fee Upload Started ===');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Get user info from auth middleware
    if (!req.user || (!req.user._id && !req.user.id)) {
      console.error('❌ User not authenticated or user ID missing');
      console.error('req.user:', req.user);
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const academicYear = req.body.academicYear || '2024-2025';
    const userId = req.user._id || req.user.id;
    const collectedBy = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;
    
    console.log(`Academic Year: ${academicYear}`);
    console.log(`Uploaded by: ${req.user.name || req.user.email || 'Unknown'} (${collectedBy})`);
    console.log(`User ID type:`, typeof userId, userId);
    
    // Parse Excel file
    const data = parseExcelFile(req.file.buffer);
    console.log(`Parsed ${data.length} rows from Excel`);
    
    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty'
      });
    }
    
    // Validate all rows
    const validations = data.map((row, index) => validateRow(row, index));
    
    const validRows = validations.filter(v => v.valid);
    const invalidRows = validations.filter(v => !v.valid);
    
    console.log(`Valid rows: ${validRows.length}`);
    console.log(`Invalid rows: ${invalidRows.length}`);
    
    // Process valid rows
    const results = {
      total: data.length,
      valid: validRows.length,
      invalid: invalidRows.length,
      processed: 0,
      successful: 0,
      failed: 0,
      alreadyPaid: 0,
      details: []
    };
    
    for (const validation of validRows) {
      const result = await processRow(validation.data, collectedBy, academicYear);
      results.processed++;
      
      if (result.success) {
        results.successful++;
        if (result.message.includes('Already')) {
          results.alreadyPaid++;
        }
      } else {
        results.failed++;
      }
      
      results.details.push({
        rowNumber: validation.rowNumber,
        ...result
      });
    }
    
    // Add invalid rows to details
    invalidRows.forEach(v => {
      results.details.push({
        rowNumber: v.rowNumber,
        success: false,
        studentId: v.data.studentId,
        year: v.data.year,
        status: v.data.isPaid ? 'Paid' : 'Not Paid',
        message: `Validation errors: ${v.errors.join(', ')}`,
        billNumber: null,
        receiptNumber: null
      });
    });
    
    console.log('\n=== Upload Summary ===');
    console.log(`Total rows: ${results.total}`);
    console.log(`Successful: ${results.successful}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Already Paid: ${results.alreadyPaid}`);
    console.log('=== End Bulk Upload ===\n');
    
    return res.json({
      success: true,
      message: 'Bulk upload completed',
      results
    });
    
  } catch (error) {
    console.error('Error in bulk upload:', error);
    next(error);
  }
};

/**
 * Download sample Excel template
 */
exports.downloadTemplate = async (req, res) => {
  try {
    // Create sample data
    const sampleData = [
      {
        'Student ID': 'STU001234',
        'Fee Year': '1',
        'Payment Status': 'Paid'
      },
      {
        'Student ID': 'STU001235',
        'Fee Year': '2',
        'Payment Status': 'Not Paid'
      },
      {
        'Student ID': 'STU001236',
        'Fee Year': '1st Year',
        'Payment Status': 'Paid'
      }
    ];
    
    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fee Upload Template');
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 12 },
      { wch: 15 }
    ];
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename=fee_upload_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
    
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate template'
    });
  }
};
