const Fee = require('../models/Fee');
const Student = require('../models/Student');
const PenaltyConfig = require('../models/PenaltyConfig');

// Get Student Fee Details for Mobile App
exports.getStudentFeeDetails = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { academicYear, semester } = req.query;

    // Validate student exists
    const student = await Student.findById(studentId).select('-password');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        error: {
          field: 'studentId',
          message: 'No student exists with the provided ID'
        }
      });
    }

    // Build filter
    const filter = { studentId };
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    // Get fee details
    const feeDetails = await Fee.find(filter)
      .populate('studentId', 'firstName lastName studentId enrollmentNumber programName')
      .sort({ academicYear: -1, semester: -1 });

    if (feeDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No fee details found for the student',
        error: {
          field: 'feeDetails',
          message: 'Fee details not available for the specified criteria'
        }
      });
    }

    // Calculate penalty for overdue fees
    for (let fee of feeDetails) {
      if (fee.isCurrentlyOverdue && !fee.isOverdue) {
        await this.applyPenalty(fee);
      }
    }

    // Format response for mobile app
    const formattedResponse = feeDetails.map(fee => ({
      // Student Information
      studentInfo: {
        studentName: `${fee.studentId.firstName} ${fee.studentId.lastName}`,
        studentId: fee.studentId.studentId,
        courseGroup: fee.studentId.programName,
        yearBatch: fee.academicYear,
        enrollmentNumber: fee.studentId.enrollmentNumber
      },
      
      // Fee Due Section
      feeDueSection: {
        currentDueAmount: fee.dueAmount,
        feeBreakdown: {
          tuitionFee: fee.feeBreakdown.tuitionFee,
          semesterFee: fee.feeBreakdown.semesterFee,
          hostelFee: fee.feeBreakdown.hostelFee,
          libraryFee: fee.feeBreakdown.libraryFee,
          labFee: fee.feeBreakdown.labFee,
          otherFees: fee.feeBreakdown.otherFees
        },
        totalDueAmount: fee.dueAmount,
        penaltyAmount: fee.penaltyAmount,
        dueDate: fee.dueDate,
        isOverdue: fee.isCurrentlyOverdue,
        status: fee.status
      },
      
      // Payment History
      paymentHistory: fee.paymentHistory.map(payment => ({
        paymentDate: payment.paymentDate,
        amountPaid: payment.amountPaid,
        modeOfPayment: payment.paymentMode,
        transactionId: payment.transactionId,
        receiptNumber: payment.receiptNumber,
        paymentStatus: payment.paymentStatus,
        balanceAfterPayment: payment.balanceAfterPayment
      })),
      
      // Meta Information
      feeId: fee._id,
      academicYear: fee.academicYear,
      semester: fee.semester,
      lastUpdated: fee.updatedAt
    }));

    res.json({
      success: true,
      message: 'Student fee details retrieved successfully',
      data: formattedResponse
    });

  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
        error: {
          field: 'studentId',
          message: 'Student ID must be a valid ObjectId'
        }
      });
    }
    next(err);
  }
};

// Create Fee Structure
exports.createFeeStructure = async (req, res, next) => {
  try {
    const {
      studentId, academicYear, semester, feeBreakdown, dueDate
    } = req.body;

    // Validate required fields
    if (!studentId || !academicYear || !semester || !feeBreakdown || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors: [
          ...(!studentId ? [{ field: 'studentId', message: 'Student ID is required' }] : []),
          ...(!academicYear ? [{ field: 'academicYear', message: 'Academic year is required' }] : []),
          ...(!semester ? [{ field: 'semester', message: 'Semester is required' }] : []),
          ...(!feeBreakdown ? [{ field: 'feeBreakdown', message: 'Fee breakdown is required' }] : []),
          ...(!dueDate ? [{ field: 'dueDate', message: 'Due date is required' }] : [])
        ]
      });
    }

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        error: {
          field: 'studentId',
          message: 'No student exists with the provided ID'
        }
      });
    }

    // Check if fee structure already exists
    const existingFee = await Fee.findOne({ studentId, academicYear, semester });
    if (existingFee) {
      return res.status(409).json({
        success: false,
        message: 'Fee structure already exists for this student, academic year, and semester',
        error: {
          field: 'duplicate',
          message: 'Duplicate fee structure'
        }
      });
    }

    // Validate fee breakdown
    const requiredFeeFields = ['tuitionFee', 'semesterFee'];
    const missingFeeFields = requiredFeeFields.filter(field => 
      feeBreakdown[field] === undefined || feeBreakdown[field] === null
    );

    if (missingFeeFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fee fields: ${missingFeeFields.join(', ')}`,
        errors: missingFeeFields.map(field => ({
          field: `feeBreakdown.${field}`,
          message: `${field} is required`
        }))
      });
    }

    // Create fee structure
    const fee = new Fee({
      studentId,
      academicYear,
      semester,
      feeBreakdown,
      dueDate: new Date(dueDate)
    });

    await fee.save();

    // Populate student details for response
    await fee.populate('studentId', 'firstName lastName studentId enrollmentNumber programName');

    res.status(201).json({
      success: true,
      message: 'Fee structure created successfully',
      data: fee
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message,
        value: error.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    next(err);
  }
};

// Process Payment
exports.processPayment = async (req, res, next) => {
  try {
    const { feeId } = req.params;
    const {
      amountPaid, paymentMode, transactionId, receiptNumber, 
      paymentGateway, gatewayTransactionId
    } = req.body;

    // Validate required fields
    if (!amountPaid || !paymentMode || !transactionId || !receiptNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment fields',
        errors: [
          ...(!amountPaid ? [{ field: 'amountPaid', message: 'Amount paid is required' }] : []),
          ...(!paymentMode ? [{ field: 'paymentMode', message: 'Payment mode is required' }] : []),
          ...(!transactionId ? [{ field: 'transactionId', message: 'Transaction ID is required' }] : []),
          ...(!receiptNumber ? [{ field: 'receiptNumber', message: 'Receipt number is required' }] : [])
        ]
      });
    }

    // Find fee record
    const fee = await Fee.findById(feeId).populate('studentId', 'firstName lastName studentId');
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found',
        error: {
          field: 'feeId',
          message: 'No fee record exists with the provided ID'
        }
      });
    }

    // Validate payment amount
    if (amountPaid > fee.dueAmount) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount cannot exceed due amount',
        error: {
          field: 'amountPaid',
          message: `Maximum payable amount is ${fee.dueAmount}`
        }
      });
    }

    // Check for duplicate transaction ID
    const existingTransaction = await Fee.findOne({
      'paymentHistory.transactionId': transactionId
    });

    if (existingTransaction) {
      return res.status(409).json({
        success: false,
        message: 'Transaction ID already exists',
        error: {
          field: 'transactionId',
          message: 'This transaction ID has already been used'
        }
      });
    }

    // Add payment to history
    const paymentRecord = {
      paymentDate: new Date(),
      amountPaid: parseFloat(amountPaid),
      paymentMode,
      transactionId,
      receiptNumber,
      paymentStatus: 'Successful',
      balanceAfterPayment: fee.dueAmount - parseFloat(amountPaid),
      paymentGateway,
      gatewayTransactionId
    };

    fee.paymentHistory.push(paymentRecord);
    fee.paidAmount += parseFloat(amountPaid);

    await fee.save();

    // Populate for response
    await fee.populate('studentId', 'firstName lastName studentId enrollmentNumber');

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        feeRecord: fee,
        paymentDetails: paymentRecord,
        remainingBalance: fee.dueAmount
      }
    });

  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid fee ID format',
        error: {
          field: 'feeId',
          message: 'Fee ID must be a valid ObjectId'
        }
      });
    }

    next(err);
  }
};

// Apply Penalty (Internal method)
exports.applyPenalty = async (fee) => {
  try {
    // Get penalty configuration for the academic year
    const penaltyConfig = await PenaltyConfig.findOne({
      academicYear: fee.academicYear,
      isActive: true
    });

    if (!penaltyConfig) {
      return; // No penalty configuration found
    }

    // Calculate days overdue
    const currentDate = new Date();
    const dueDate = new Date(fee.dueDate);
    const daysOverdue = Math.floor((currentDate - dueDate) / (1000 * 60 * 60 * 24));

    if (daysOverdue > 0) {
      const penaltyAmount = penaltyConfig.calculatePenalty(fee.dueAmount, daysOverdue);
      
      if (penaltyAmount > 0) {
        fee.penaltyAmount = penaltyAmount;
        fee.isOverdue = true;
        fee.penaltyAppliedDate = new Date();
        await fee.save();
      }
    }
  } catch (err) {
    console.error('Error applying penalty:', err);
  }
};

// Get Payment History
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10, academicYear } = req.query;

    // Build filter
    const filter = { studentId };
    if (academicYear) filter.academicYear = academicYear;

    const skip = (page - 1) * limit;
    
    const fees = await Fee.find(filter)
      .populate('studentId', 'firstName lastName studentId enrollmentNumber')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Extract all payments
    let allPayments = [];
    fees.forEach(fee => {
      fee.paymentHistory.forEach(payment => {
        allPayments.push({
          ...payment.toObject(),
          academicYear: fee.academicYear,
          semester: fee.semester,
          studentName: `${fee.studentId.firstName} ${fee.studentId.lastName}`
        });
      });
    });

    // Sort by payment date
    allPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    const total = allPayments.length;

    res.json({
      success: true,
      message: 'Payment history retrieved successfully',
      data: allPayments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPayments: total
      }
    });

  } catch (err) {
    next(err);
  }
};