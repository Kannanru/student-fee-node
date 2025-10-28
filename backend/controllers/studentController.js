const studentService = require('../services/student.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const FeePlan = require('../models/FeePlan');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const StudentBill = require('../models/StudentBill');

// Create Student
exports.create = async (req, res, next) => {
  try {
    console.log('📝 Student creation request received');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Section value:', req.body.section);
    console.log('Roll Number value:', req.body.rollNumber);
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    
    const required = ['studentId', 'enrollmentNumber', 'firstName', 'lastName', 'dob', 'gender', 'email', 'contactNumber', 'permanentAddress', 'programName', 'admissionDate', 'academicYear', 'guardianName', 'guardianContact', 'emergencyContactName', 'emergencyContactNumber', 'studentType', 'password'];
    const missing = required.filter(f => !req.body[f]);
    
    if (missing.length) {
      return res.status(400).json({ success: false, message: 'Missing required fields', fields: missing });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const data = await studentService.createStudent(req.body, hashedPassword);
    
    console.log('✅ Student created successfully');
    console.log('Created student section:', data.section);
    console.log('Created student rollNumber:', data.rollNumber);
    
    return res.status(201).json({ success: true, message: 'Student created successfully', data });
  } catch (err) {
    next(err);
  }
};

// Student Login (mobile)
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const student = await studentService.findByEmail(email);
    if (!student) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    
    const ok = await bcrypt.compare(password, student.password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { studentId: student._id, email: student.email, role: 'student' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
    
    const profile = student.toObject();
    delete profile.password;
    
    return res.json({ success: true, message: 'Login successful', data: { token, student: profile } });
  } catch (err) {
    next(err);
  }
};

// Update Student
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };
    let hashedPassword = null;
    
    if (update.password) {
      hashedPassword = await bcrypt.hash(update.password, 10);
      delete update.password; // Remove from update object, will be added by service
    }
    
    const data = await studentService.updateStudent(id, update, hashedPassword);
    return res.json({ success: true, message: 'Student updated successfully', data });
  } catch (err) {
    next(err);
  }
};

// Get All Students with filters
exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, programName, academicYear, semester, status, studentType, year, section, search } = req.query;
    
    const filters = {};
    if (programName) filters.programName = programName;
    if (academicYear) filters.academicYear = academicYear;
    if (semester) filters.semester = semester;
    if (status) filters.status = status;
    if (studentType) filters.studentType = studentType;
    if (year) filters.year = parseInt(year);
    if (section) filters.section = section;
    
    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { enrollmentNumber: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const result = await studentService.getStudentsWithPagination(filters, { page, limit });
    
    return res.json({
      success: true,
      message: 'Students retrieved successfully',
      data: result.students,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

// Get by ID (profile)
exports.getById = async (req, res, next) => {
  try {
    const student = await studentService.findOne(req.params.id, { select: '-password' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    return res.json({ success: true, message: 'Student retrieved successfully', data: student });
  } catch (err) {
    next(err);
  }
};

// Delete Student
exports.remove = async (req, res, next) => {
  try {
    const student = await studentService.remove(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    return res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Get Student Fees
exports.getStudentFees = async (req, res, next) => {
  try {
    const feeService = require('../services/fee.service');
    const fees = await feeService.getStudentFeeDetailsWithPenalty(req.params.id);
    return res.json({ success: true, message: 'Student fees retrieved successfully', data: fees });
  } catch (err) {
    if (err.message === 'Student not found') {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// Get Student Fee Status (for fee collection)
exports.getStudentFeeStatus = async (req, res, next) => {
  try {
    const Student = require('../models/Student');
    const FeePlan = require('../models/FeePlan');
    const Payment = require('../models/Payment');
    const FeeHead = require('../models/FeeHead');

    const { id } = req.params;

    // Get student details
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Calculate year from admission date if not available
    let studentYear = student.year;
    if (!studentYear && student.admissionDate) {
      const admissionYear = new Date(student.admissionDate).getFullYear();
      const currentYear = new Date().getFullYear();
      studentYear = currentYear - admissionYear + 1;
    }

    // Parse semester to number
    const studentSemester = student.semester ? parseInt(student.semester) : null;
    
    // Get quota (may not exist in student model)
    const studentQuota = student.quota || student.quotaType || null;

    console.log('Student details:', {
      program: student.program || student.programName,
      year: studentYear,
      semester: studentSemester,
      quota: studentQuota,
      admissionDate: student.admissionDate
    });

    // Find matching fee structure with multiple fallback strategies
    let feeStructure = null;
    
    // Strategy 1: Exact match (program + year + semester + quota)
    if (studentYear && studentSemester && studentQuota) {
      feeStructure = await FeePlan.findOne({
        program: student.program || student.programName,
        year: studentYear,
        semester: studentSemester,
        quota: studentQuota,
        status: 'active'
      });
      console.log('Strategy 1 (exact match):', feeStructure ? 'Found' : 'Not found');
    }

    // Strategy 2: Without quota (program + year + semester)
    if (!feeStructure && studentYear && studentSemester) {
      feeStructure = await FeePlan.findOne({
        program: student.program || student.programName,
        year: studentYear,
        semester: studentSemester,
        status: 'active'
      });
      console.log('Strategy 2 (without quota):', feeStructure ? 'Found' : 'Not found');
    }

    // Strategy 3: Just program and year
    if (!feeStructure && studentYear) {
      feeStructure = await FeePlan.findOne({
        program: student.program || student.programName,
        year: studentYear,
        status: 'active'
      });
      console.log('Strategy 3 (program + year):', feeStructure ? 'Found' : 'Not found');
    }

    // Strategy 4: Just program and semester
    if (!feeStructure && studentSemester) {
      feeStructure = await FeePlan.findOne({
        program: student.program || student.programName,
        semester: studentSemester,
        status: 'active'
      });
      console.log('Strategy 4 (program + semester):', feeStructure ? 'Found' : 'Not found');
    }

    // Strategy 5: Just program (any year, any semester)
    if (!feeStructure) {
      feeStructure = await FeePlan.findOne({
        program: student.program || student.programName,
        status: 'active'
      });
      console.log('Strategy 5 (program only):', feeStructure ? 'Found' : 'Not found');
    }

    // If still not found, return error
    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: `No active fee structure found for program "${student.program || student.programName}". Please create a fee structure for this program.`
      });
    }

    console.log('Using fee structure:', feeStructure.code);

    // Populate fee heads - handle both array structures
    let feeHeads = [];
    if (feeStructure.heads && Array.isArray(feeStructure.heads)) {
      // Get all fee head IDs
      const headIds = feeStructure.heads.map(h => h.headId || h);
      
      // Fetch all fee head details
      feeHeads = await FeeHead.find({ _id: { $in: headIds } });
      
      // Map amounts from fee structure
      const amountMap = {};
      feeStructure.heads.forEach(h => {
        const id = (h.headId || h).toString();
        amountMap[id] = h.amount || h.totalAmount || 0;
      });
      
      // Update amounts in fee heads
      feeHeads = feeHeads.map(head => ({
        ...head.toObject(),
        amount: amountMap[head._id.toString()] || head.amount
      }));
    }

    console.log(`Loaded ${feeHeads.length} fee heads`);

    // Get all payments for this student
    const payments = await Payment.find({ studentId: id });
    console.log(`Found ${payments.length} payments for student`);

    // Build set of paid fee head IDs
    const paidFeeHeadIds = new Set();
    payments.forEach(payment => {
      if (payment.headsPaid && Array.isArray(payment.headsPaid)) {
        payment.headsPaid.forEach(head => {
          if (head.headId) {
            paidFeeHeadIds.add(head.headId.toString());
          }
        });
      }
    });

    console.log(`${paidFeeHeadIds.size} unique fee heads have been paid`);

    // Separate paid and remaining fee heads
    const paidFeeHeads = [];
    const remainingFeeHeads = [];
    let totalPaid = 0;
    let totalRemaining = 0;

    feeHeads.forEach(head => {
      const headObj = {
        _id: head._id,
        code: head.code,
        name: head.name,
        amount: head.amount,
        category: head.category,
        taxable: head.taxable
      };

      if (paidFeeHeadIds.has(head._id.toString())) {
        paidFeeHeads.push(headObj);
        totalPaid += head.amount || 0;
      } else {
        remainingFeeHeads.push(headObj);
        totalRemaining += head.amount || 0;
      }
    });

    console.log(`Paid: ${paidFeeHeads.length}, Remaining: ${remainingFeeHeads.length}`);

    return res.json({
      success: true,
      message: 'Student fee status retrieved successfully',
      data: {
        student: {
          _id: student._id,
          studentId: student.studentId,
          name: `${student.firstName} ${student.lastName}`,
          program: student.program || student.programName,
          year: student.year,
          semester: student.semester,
          quota: student.quota
        },
        feeStructure: {
          _id: feeStructure._id,
          code: feeStructure.code,
          name: feeStructure.name,
          program: feeStructure.program,
          year: feeStructure.year,
          semester: feeStructure.semester,
          quota: feeStructure.quota,
          heads: feeHeads,
          totalAmount: feeStructure.totalAmount
        },
        paidFeeHeads,
        remainingFeeHeads,
        totalPaid,
        totalRemaining,
        paymentsCount: payments.length
      }
    });
  } catch (err) {
    console.error('Error in getStudentFeeStatus:', err);
    next(err);
  }
};

// Get Student Fee Status (for fee collection)
exports.getStudentFeeStatus = async (req, res, next) => {
  try {
    const Student = require('../models/Student');
    const FeePlan = require('../models/FeePlan');
    const Payment = require('../models/Payment');
    
    // Get student details
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Find applicable fee structure based on student's program, year, semester, and quota
    const feeStructure = await FeePlan.findOne({
      program: student.programName,
      year: student.year || 1, // Default to year 1 if not set
      semester: student.semester || 1, // Default to semester 1 if not set
      quota: student.quota || 'Management', // Default to Management if not set
      isActive: true
    }).populate('heads', 'code name amount');
    
    if (!feeStructure) {
      return res.status(404).json({ 
        success: false, 
        message: 'No fee structure found for this student. Please create a fee structure matching the student\'s program, year, semester, and quota.' 
      });
    }
    
    // Get all payments made by this student
    const payments = await Payment.find({ studentId: req.params.id });
    
    // Build set of paid fee head IDs
    const paidFeeHeadIds = new Set();
    payments.forEach(payment => {
      if (payment.feeHeadIds && Array.isArray(payment.feeHeadIds)) {
        payment.feeHeadIds.forEach(id => paidFeeHeadIds.add(id.toString()));
      }
    });
    
    // Separate paid and unpaid fee heads
    const paidFeeHeads = [];
    const remainingFeeHeads = [];
    let totalPaid = 0;
    let totalRemaining = 0;
    
    feeStructure.heads.forEach(head => {
      const headObj = {
        _id: head._id.toString(),
        code: head.code,
        name: head.name,
        amount: head.amount
      };
      
      if (paidFeeHeadIds.has(head._id.toString())) {
        paidFeeHeads.push(headObj);
        totalPaid += head.amount;
      } else {
        remainingFeeHeads.push(headObj);
        totalRemaining += head.amount;
      }
    });
    
    const result = {
      feeStructure: {
        _id: feeStructure._id,
        code: feeStructure.code,
        program: feeStructure.program,
        year: feeStructure.year,
        semester: feeStructure.semester,
        quota: feeStructure.quota,
        heads: feeStructure.heads,
        totalAmount: feeStructure.totalAmount
      },
      paidFeeHeads,
      remainingFeeHeads,
      totalPaid,
      totalRemaining,
      paymentsCount: payments.length
    };
    
    return res.json({ 
      success: true, 
      message: 'Student fee status retrieved successfully', 
      data: result 
    });
  } catch (err) {
    next(err);
  }
};

// Get all fee structures for a student
exports.getStudentFeeStructures = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get student details
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    console.log('Loading fee structures for student:', {
      program: student.program || student.programName,
      year: student.year,
      semester: student.semester,
      quota: student.quota
    });

    // Parse semester to number
    const studentSemester = student.semester ? parseInt(student.semester) : null;

    // Find all matching fee structures with multiple strategies
    const matchQueries = [];

    // Query 1: Exact match (program + year + semester + quota)
    if (student.year && studentSemester && student.quota) {
      matchQueries.push({
        program: student.program || student.programName,
        year: student.year,
        semester: studentSemester,
        quota: student.quota,
        status: 'active'
      });
    }

    // Query 2: Without quota (program + year + semester)
    if (student.year && studentSemester) {
      matchQueries.push({
        program: student.program || student.programName,
        year: student.year,
        semester: studentSemester,
        status: 'active'
      });
    }

    // Query 3: Just program and year
    if (student.year) {
      matchQueries.push({
        program: student.program || student.programName,
        year: student.year,
        status: 'active'
      });
    }

    // Query 4: Just program
    matchQueries.push({
      program: student.program || student.programName,
      status: 'active'
    });

    // Execute queries and combine results (remove duplicates)
    const feeStructureMap = new Map();
    
    for (const query of matchQueries) {
      const structures = await FeePlan.find(query)
        .populate({
          path: 'heads.headId',
          model: 'FeeHead',
          select: 'code name description category'
        })
        .sort({ year: 1, semester: 1 });

      structures.forEach(structure => {
        if (!feeStructureMap.has(structure._id.toString())) {
          feeStructureMap.set(structure._id.toString(), structure);
        }
      });
    }

    const feeStructures = Array.from(feeStructureMap.values());

    console.log(`Found ${feeStructures.length} fee structures`);

    return res.json({
      success: true,
      message: 'Fee structures retrieved successfully',
      data: feeStructures
    });
  } catch (err) {
    console.error('Error in getStudentFeeStructures:', err);
    next(err);
  }
};

// Get fee heads with payment status for a specific fee structure
exports.getFeeHeadsWithPaymentStatus = async (req, res, next) => {
  try {
    const { id, structureId } = req.params;

    // Get student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get fee structure
    const feeStructure = await FeePlan.findById(structureId)
      .populate({
        path: 'heads.headId',
        model: 'FeeHead'
      });

    if (!feeStructure) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }

    // Get all paid invoices for this student (status = 'paid')
    const Invoice = require('../models/Invoice');
    
    // Get list of fee head IDs from this structure
    const structureFeeHeadIds = feeStructure.heads.map(h => 
      (h.headId?._id || h.headId).toString()
    );

    // Find all paid invoices for this student for fee heads in this structure
    const paidInvoices = await Invoice.find({
      studentId: id,
      feeHeadId: { $in: structureFeeHeadIds },
      status: 'paid'
    });

    console.log(`Found ${paidInvoices.length} paid invoices for student ${id} in structure ${structureId}`);

    // Get bill numbers for paid invoices via StudentBill
    const StudentBill = require('../models/StudentBill');
    const Payment = require('../models/Payment');
    
    // Get student bills for this student (load all, not just paid status)
    const studentBills = await StudentBill.find({
      studentId: id
    }).select('billNumber heads status paidInFullDate paymentDate createdAt').lean();

    console.log(`Found ${studentBills.length} bills for student ${id}`);
    
    // Build map of paid fee head IDs with payment details
    const paidFeeHeadIds = new Set();
    const feeHeadPayments = new Map();

    // First, add from paid invoices
    paidInvoices.forEach(invoice => {
      const headId = invoice.feeHeadId.toString();
      paidFeeHeadIds.add(headId);
      
      feeHeadPayments.set(headId, {
        paidAmount: invoice.amount,
        paidDate: invoice.issueDate || invoice.createdAt,
        invoiceId: invoice._id,
        billNumber: null
      });
    });

    // Second, add/update from student bills (includes bulk upload payments)
    studentBills.forEach(bill => {
      console.log(`Bill ${bill.billNumber} (${bill.status}) has ${bill.heads?.length || 0} heads`);
      
      if (bill.heads) {
        bill.heads.forEach(head => {
          const headId = head.headId.toString();
          
          // Only process if this head is in the current structure
          if (structureFeeHeadIds.includes(headId)) {
            // Check if this head is paid (paidAmount > 0 or balanceAmount === 0)
            const isPaidInBill = head.paidAmount > 0 || head.balanceAmount === 0;
            
            if (isPaidInBill) {
              // If not already in map from invoice, add from bill
              if (!feeHeadPayments.has(headId)) {
                paidFeeHeadIds.add(headId);
                feeHeadPayments.set(headId, {
                  paidAmount: head.paidAmount,
                  paidDate: bill.paidInFullDate || bill.paymentDate || bill.createdAt,
                  invoiceId: null,
                  billNumber: bill.billNumber
                });
                console.log(`✅ Added payment info from bill for head ${headId}: ₹${head.paidAmount}, Bill: ${bill.billNumber}`);
              } else {
                // Update bill number if we have one
                const existing = feeHeadPayments.get(headId);
                if (bill.billNumber && !existing.billNumber) {
                  existing.billNumber = bill.billNumber;
                  console.log(`✅ Updated bill number for head ${headId}: ${bill.billNumber}`);
                }
              }
            }
          }
        });
      }
    });

    // Build fee heads array with payment status
    const feeHeads = feeStructure.heads.map(head => {
      const headData = head.headId || head;
      const headId = (head.headId?._id || head._id).toString();
      const isPaid = paidFeeHeadIds.has(headId);
      const paymentInfo = feeHeadPayments.get(headId);

      return {
        _id: headId,
        code: headData.code,
        name: headData.name,
        description: headData.description,
        amount: head.amount || 0,
        totalAmount: head.totalAmount || head.amount || 0,
        taxAmount: head.taxAmount || 0,
        isPaid,
        paidAmount: paymentInfo?.paidAmount || 0,
        paidDate: paymentInfo?.paidDate || null,
        invoiceId: paymentInfo?.invoiceId || null,
        billNumber: paymentInfo?.billNumber || null
      };
    });

    console.log(`Fee heads for structure ${structureId}:`, {
      total: feeHeads.length,
      paid: feeHeads.filter(h => h.isPaid).length,
      unpaid: feeHeads.filter(h => !h.isPaid).length
    });

    return res.json({
      success: true,
      message: 'Fee heads retrieved successfully',
      data: feeHeads
    });
  } catch (err) {
    console.error('Error in getFeeHeadsWithPaymentStatus:', err);
    next(err);
  }
};

// Get semester-wise fee details for a student
exports.getStudentSemesterFees = async (req, res, next) => {
  try {
    const { id, semester } = req.params;

    console.log(`\n=== Fetching fee heads for student ${id}, semester ${semester} ===`);

    // Find student to get their program details
    const student = await Student.findById(id);
    if (!student) {
      console.log('❌ Student not found');
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    console.log(`✅ Student found: ${student.firstName} ${student.lastName}`);
    console.log(`   Program: ${student.programName}, Year: ${student.year}, Quota: ${student.quota || 'puducherry-ut'}`);

    // Calculate year from semester if student.year is not available
    // Semesters 1-2 = Year 1, 3-4 = Year 2, etc.
    const studentYear = student.year || Math.ceil(parseInt(semester) / 2);
    console.log(`   Using Year: ${studentYear} (${student.year ? 'from student record' : 'calculated from semester'})`);

    // Find fee plan for this student's program, year, semester, and quota
    const feePlan = await FeePlan.findOne({ 
      program: student.programName,
      year: studentYear,
      semester: parseInt(semester),
      quota: student.quota || 'puducherry-ut',
      status: 'active'
    }).populate('heads.headId', 'name description category code');

    if (!feePlan) {
      console.log('❌ No fee plan found for this program/year/semester/quota combination');
      return res.json({
        success: true,
        message: 'No fees found for this semester',
        data: []
      });
    }

    console.log(`✅ Fee plan found: ${feePlan.planName} (${feePlan.heads.length} fee heads)`);

    // Get all fee head IDs from the plan
    const feeHeadIds = feePlan.heads.map(h => h.headId._id.toString());
    console.log(`   Fee head IDs: ${feeHeadIds.join(', ')}`);

    // Get all paid invoices for these fee heads
    const paidInvoices = await Invoice.find({
      studentId: id,
      feeHeadId: { $in: feeHeadIds },
      status: 'paid'
    }).select('feeHeadId amount issueDate _id');

    // Get all student bills for this semester
    const studentBills = await StudentBill.find({
      studentId: id,
      semester: parseInt(semester)
    }).select('_id billNumber heads paymentDate semester status paidInFullDate').lean();

    console.log(`Found ${studentBills.length} bills for student ${id}, semester ${semester}`);

    // Get payment records to fetch fine information for this semester
    const billIds = studentBills.map(b => b._id);
    const payments = await Payment.find({
      studentId: id,
      status: { $in: ['confirmed', 'completed', 'paid', 'success'] },
      $or: [
        { semester: parseInt(semester) },
        { billId: { $in: billIds } }
      ]
    }).select('headsPaid fineAmount daysDelayed finePerDay paymentDate billId semester').lean();

    console.log(`Found ${payments.length} completed payments for student ${id}`);

  // Compute total fine paid for this semester
  const totalFinePaid = payments.reduce((sum, p) => sum + (p.fineAmount || 0), 0);

    // Build map of fee head to payment info including fine
    const feeHeadPayments = new Map();
    const feeHeadToBillMap = new Map();

    // Add from paid invoices
    paidInvoices.forEach(invoice => {
      const headId = invoice.feeHeadId.toString();
      feeHeadPayments.set(headId, {
        paidAmount: invoice.amount,
        paidDate: invoice.issueDate,
        invoiceId: invoice._id,
        fineAmount: 0,
        daysDelayed: 0,
        finePerDay: 0
      });
    });

    // Add from student bills (including bulk uploaded payments)
    studentBills.forEach(bill => {
      if (bill.heads) {
        bill.heads.forEach(head => {
          const headId = head.headId.toString();
          // Only process if this head is in the current semester's fee plan
          if (feeHeadIds.includes(headId) && head.paidAmount > 0) {
            // If not already in map from invoice, add from bill
            if (!feeHeadPayments.has(headId)) {
              feeHeadPayments.set(headId, {
                paidAmount: head.paidAmount,
                paidDate: bill.paidInFullDate || bill.paymentDate,
                invoiceId: null,
                fineAmount: 0,
                daysDelayed: 0,
                finePerDay: 0
              });
              console.log(`✅ Added payment info from bill for head ${headId}: ₹${head.paidAmount}`);
            }
            
            // Map bill number
            if (bill.billNumber) {
              feeHeadToBillMap.set(headId, bill.billNumber);
            }
          }
        });
      }
    });

    // Map fine amounts from payments to fee heads (display purpose only)
    payments.forEach(payment => {
      if (payment.fineAmount && payment.fineAmount > 0) {
        console.log(`Payment has fine: ₹${payment.fineAmount}, days: ${payment.daysDelayed}, rate: ₹${payment.finePerDay}/day`);
        
        if (payment.headsPaid && Array.isArray(payment.headsPaid)) {
          // Assign fine to all heads paid in this payment
          payment.headsPaid.forEach(hp => {
            const headId = hp.headId?.toString();
            
            if (feeHeadPayments.has(headId)) {
              const existing = feeHeadPayments.get(headId);
              existing.fineAmount = payment.fineAmount;
              existing.daysDelayed = payment.daysDelayed || 0;
              existing.finePerDay = payment.finePerDay || 0;
              console.log(`  ✅ Assigned fine ₹${payment.fineAmount} to fee head ${headId}`);
            }
          });
        }
      }
    });

    // Map bill numbers from StudentBill.heads
    studentBills.forEach(bill => {
      if (bill.heads && bill.billNumber) {
        bill.heads.forEach(head => {
          const headId = head.headId.toString();
          // Only map if this head is in the current semester's fee plan
          if (feeHeadIds.includes(headId)) {
            feeHeadToBillMap.set(headId, bill.billNumber);
            console.log(`Mapped fee head ${headId} to bill ${bill.billNumber}`);
            
            // If we have invoice but no payment date, use bill's payment date
            if (feeHeadPayments.has(headId) && bill.paymentDate) {
              const existing = feeHeadPayments.get(headId);
              if (!existing.paidDate) {
                existing.paidDate = bill.paymentDate;
              }
            }
          }
        });
      }
    });

    console.log(`Mapped ${feeHeadToBillMap.size} fee heads to bill numbers`);

    // Build fee heads response
    const feeHeads = feePlan.heads.map(head => {
      const headId = head.headId._id.toString();
      const isPaid = feeHeadPayments.has(headId);
      const paymentInfo = feeHeadPayments.get(headId);
      const billNumber = feeHeadToBillMap.get(headId);

      return {
        _id: headId,
        name: head.headId.name,
        code: head.headId.code,
        description: head.headId.description,
        category: head.headId.category,
        totalAmount: head.totalAmount || (head.amount + (head.taxAmount || 0)),
        amount: head.amount,
        taxAmount: head.taxAmount || 0,
        isPaid,
        paidAmount: paymentInfo?.paidAmount || 0,
        paidDate: paymentInfo?.paidDate || null,
        invoiceId: paymentInfo?.invoiceId || null,
        billNumber: billNumber || null,
        fineAmount: paymentInfo?.fineAmount || 0,
        daysDelayed: paymentInfo?.daysDelayed || 0,
        finePerDay: paymentInfo?.finePerDay || 0
      };
    });

    const summary = {
      total: feeHeads.length,
      paid: feeHeads.filter(h => h.isPaid).length,
      unpaid: feeHeads.filter(h => !h.isPaid).length
    };
    
    console.log(`\n📊 Semester ${semester} Fee Summary:`, summary);
    console.log(`   Paid fees:`, feeHeads.filter(h => h.isPaid).map(f => `${f.name} (${f.billNumber})`).join(', ') || 'None');
    console.log(`=== End getStudentSemesterFees ===\n`);

    return res.json({
      success: true,
      message: 'Semester fees retrieved successfully',
      data: feeHeads,
      meta: {
        totalFinePaid
      }
    });
  } catch (err) {
    console.error('❌ Error in getStudentSemesterFees:', err);
    next(err);
  }
};

