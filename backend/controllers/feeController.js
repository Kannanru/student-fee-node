const feeService = require('../services/fee.service');

exports.createFeeStructure = async (req, res, next) => {
  try {
    const { studentId, academicYear, semester, feeBreakdown, dueDate } = req.body;
    
    // Validate required fields
    if (!studentId || !academicYear || !semester || !feeBreakdown || !dueDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Delegate to service
    const populated = await feeService.createFeeStructure({
      studentId,
      academicYear,
      semester,
      feeBreakdown,
      dueDate
    });

    res.status(201).json({
      success: true,
      message: 'Fee structure created successfully',
      data: populated
    });
  } catch (err) {
    if (err.message === 'Student not found') {
      return res.status(404).json({ success: false, message: err.message });
    }
    if (err.message === 'Fee structure already exists for student/year/semester') {
      return res.status(409).json({ success: false, message: err.message });
    }
    if (err.message === 'tuitionFee and semesterFee are required') {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

exports.getStudentFeeDetails = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { academicYear, semester } = req.query;

    // Delegate to service
    const response = await feeService.getStudentFeeDetailsWithPenalty(studentId, {
      academicYear,
      semester
    });

    res.json({
      success: true,
      message: 'Student fee details retrieved successfully',
      data: response
    });
  } catch (err) {
    if (err.message === 'Student not found') {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
};

exports.processPayment = async (req, res, next) => {
  try {
    const { feeId } = req.params;
    const { amountPaid, paymentMode, transactionId, receiptNumber, paymentGateway, gatewayTransactionId } = req.body;
    
    // Validate required fields
    if (!amountPaid || !paymentMode || !transactionId || !receiptNumber) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Delegate to service
    const result = await feeService.processPayment(feeId, {
      amountPaid,
      paymentMode,
      transactionId,
      receiptNumber,
      paymentGateway,
      gatewayTransactionId
    });

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: result
    });
  } catch (err) {
    if (err.message === 'Fee record not found') {
      return res.status(404).json({ success: false, message: err.message });
    }
    if (err.message === 'Payment amount cannot exceed due amount') {
      return res.status(400).json({
        success: false,
        message: err.message,
        error: {
          field: err.field,
          message: `Maximum payable amount is ${err.maxAmount}`
        }
      });
    }
    if (err.message === 'Duplicate transactionId') {
      return res.status(409).json({ success: false, message: err.message });
    }
    next(err);
  }
};

exports.getPaymentHistory = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10, academicYear } = req.query;

    // Delegate to service
    const result = await feeService.getPaymentHistory(studentId, {
      page,
      limit,
      academicYear
    });

    res.json({
      success: true,
      message: 'Payment history retrieved successfully',
      data: result.payments,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

// Get student fee records (all fee records)
exports.getStudentFeeRecords = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const result = await feeService.getStudentFeeDetailsWithPenalty(studentId);
    
    res.json({
      success: true,
      message: 'Student fee records retrieved successfully',
      data: result
    });
  } catch (err) {
    if (err.message === 'Student not found') {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// Get fee collection summary
exports.getCollectionSummary = async (req, res, next) => {
  try {
    const { academicYear } = req.query;
    const Fee = require('../models/Fee');
    
    const matchFilter = {};
    if (academicYear) matchFilter.academicYear = academicYear;
    
    const summary = await Fee.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalFees: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalDue: { $sum: '$dueAmount' },
          totalStudents: { $sum: 1 },
          totalPenalty: { $sum: '$penaltyAmount' }
        }
      }
    ]);
    
    const result = summary[0] || {
      totalFees: 0,
      totalPaid: 0,
      totalDue: 0,
      totalStudents: 0,
      totalPenalty: 0
    };
    
    res.json({
      success: true,
      message: 'Fee collection summary retrieved successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// Get fee defaulters
exports.getDefaulters = async (req, res, next) => {
  try {
    const { academicYear, daysPastDue = 30 } = req.query;
    const Fee = require('../models/Fee');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysPastDue));
    
    const matchFilter = {
      dueAmount: { $gt: 0 },
      dueDate: { $lt: cutoffDate }
    };
    
    if (academicYear) matchFilter.academicYear = academicYear;
    
    const defaulters = await Fee.find(matchFilter)
      .populate('studentId', 'firstName lastName studentId enrollmentNumber contactNumber')
      .sort({ dueDate: 1 });
    
    res.json({
      success: true,
      message: 'Fee defaulters retrieved successfully',
      data: defaulters,
      count: defaulters.length
    });
  } catch (err) {
    next(err);
  }
};

// Collection Report - Enhanced
exports.getCollectionReport = async (req, res, next) => {
  try {
    const { startDate, endDate, program, year, semester, status } = req.query;
    const Fee = require('../models/Fee');
    const Student = require('../models/Student');
    
    // Build match filter
    const matchFilter = {};
    
    if (startDate && endDate) {
      matchFilter.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Create aggregation pipeline
    const pipeline = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $addFields: {
          studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
          studentId: '$student.studentId',
          paidAmount: { $subtract: ['$totalAmount', '$dueAmount'] },
          pendingAmount: '$dueAmount',
          status: {
            $cond: {
              if: { $eq: ['$dueAmount', 0] },
              then: 'Paid',
              else: {
                $cond: {
                  if: { $lt: ['$dueDate', new Date()] },
                  then: 'Overdue',
                  else: {
                    $cond: {
                      if: { $gt: ['$paidAmount', 0] },
                      then: 'Partially Paid',
                      else: 'Pending'
                    }
                  }
                }
              }
            }
          }
        }
      }
    ];
    
    // Add filters based on program, year, semester
    if (program || year || semester) {
      pipeline.splice(2, 0, {
        $match: {
          ...(program && { 'student.program': program }),
          ...(year && { 'student.year': year }),
          ...(semester && { 'semester': semester })
        }
      });
    }
    
    // Add status filter
    if (status) {
      pipeline.push({ $match: { status: status } });
    }
    
    // Project final fields
    pipeline.push({
      $project: {
        studentName: 1,
        studentId: 1,
        feeHead: '$feeBreakdown.type',
        amount: '$totalAmount',
        paidAmount: 1,
        pendingAmount: 1,
        dueDate: 1,
        status: 1
      }
    });
    
    const report = await Fee.aggregate(pipeline);
    
    res.json({
      success: true,
      message: 'Collection report generated successfully',
      data: report,
      count: report.length
    });
  } catch (err) {
    next(err);
  }
};

// Department Summary Report
exports.getDepartmentSummary = async (req, res, next) => {
  try {
    const { program, year, semester, academicYear } = req.query;
    const Fee = require('../models/Fee');
    
    const matchFilter = {};
    if (academicYear) matchFilter.academicYear = academicYear;
    if (semester) matchFilter.semester = semester;
    
    const pipeline = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $match: {
          ...(program && { 'student.program': program }),
          ...(year && { 'student.year': year })
        }
      },
      {
        $group: {
          _id: {
            program: '$student.program',
            year: '$student.year',
            semester: '$semester'
          },
          totalStudents: { $addToSet: '$studentId' },
          totalAmount: { $sum: '$totalAmount' },
          collectedAmount: { $sum: { $subtract: ['$totalAmount', '$dueAmount'] } },
          pendingAmount: { $sum: '$dueAmount' }
        }
      },
      {
        $addFields: {
          totalStudents: { $size: '$totalStudents' },
          percentage: {
            $multiply: [
              { $divide: ['$collectedAmount', '$totalAmount'] },
              100
            ]
          }
        }
      },
      {
        $project: {
          program: '$_id.program',
          year: '$_id.year',
          semester: '$_id.semester',
          totalStudents: 1,
          totalAmount: 1,
          collectedAmount: 1,
          pendingAmount: 1,
          percentage: { $round: ['$percentage', 2] }
        }
      }
    ];
    
    const report = await Fee.aggregate(pipeline);
    
    res.json({
      success: true,
      message: 'Department summary generated successfully',
      data: report,
      count: report.length
    });
  } catch (err) {
    next(err);
  }
};

// Fee Head Summary Report
exports.getFeeHeadSummary = async (req, res, next) => {
  try {
    const { academicYear, program, year } = req.query;
    const Fee = require('../models/Fee');
    
    const matchFilter = {};
    if (academicYear) matchFilter.academicYear = academicYear;
    
    const pipeline = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $match: {
          ...(program && { 'student.program': program }),
          ...(year && { 'student.year': year })
        }
      },
      { $unwind: '$feeBreakdown' },
      {
        $group: {
          _id: '$feeBreakdown.type',
          totalAmount: { $sum: '$feeBreakdown.amount' },
          collectedAmount: {
            $sum: {
              $cond: {
                if: { $eq: ['$dueAmount', 0] },
                then: '$feeBreakdown.amount',
                else: 0
              }
            }
          },
          studentsCount: { $addToSet: '$studentId' }
        }
      },
      {
        $addFields: {
          studentsCount: { $size: '$studentsCount' },
          pendingAmount: { $subtract: ['$totalAmount', '$collectedAmount'] },
          collectionRate: {
            $multiply: [
              { $divide: ['$collectedAmount', '$totalAmount'] },
              100
            ]
          }
        }
      },
      {
        $project: {
          feeHead: '$_id',
          totalAmount: 1,
          collectedAmount: 1,
          pendingAmount: 1,
          studentsCount: 1,
          collectionRate: { $round: ['$collectionRate', 2] }
        }
      }
    ];
    
    const report = await Fee.aggregate(pipeline);
    
    res.json({
      success: true,
      message: 'Fee head summary generated successfully',
      data: report,
      count: report.length
    });
  } catch (err) {
    next(err);
  }
};

// Payment History Report
exports.getPaymentHistoryReport = async (req, res, next) => {
  try {
    const { startDate, endDate, paymentMethod, program, minAmount, maxAmount } = req.query;
    const Payment = require('../models/Payment');
    
    const matchFilter = {};
    
    if (startDate && endDate) {
      matchFilter.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (paymentMethod) matchFilter.paymentMethod = paymentMethod;
    if (minAmount) matchFilter.amount = { ...matchFilter.amount, $gte: parseFloat(minAmount) };
    if (maxAmount) matchFilter.amount = { ...matchFilter.amount, $lte: parseFloat(maxAmount) };
    
    const pipeline = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'fees',
          localField: 'feeId',
          foreignField: '_id',
          as: 'fee'
        }
      },
      { $unwind: '$fee' },
      {
        $match: {
          ...(program && { 'student.program': program })
        }
      },
      {
        $project: {
          date: '$paymentDate',
          studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
          feeHead: '$fee.feeBreakdown.type',
          amount: 1,
          method: '$paymentMethod',
          transactionId: 1,
          status: 1
        }
      },
      { $sort: { date: -1 } }
    ];
    
    const report = await Payment.aggregate(pipeline);
    
    res.json({
      success: true,
      message: 'Payment history report generated successfully',
      data: report,
      count: report.length
    });
  } catch (err) {
    next(err);
  }
};

// Daily Fee Payments Report (like attendance daily report)
exports.getDailyPayments = async (req, res, next) => {
  try {
    const { fromDate, toDate, date, program, year, semester } = req.query;
    const Fee = require('../models/Fee');
    
    // Support both single date and date range
    let startOfPeriod, endOfPeriod;
    
    if (fromDate && toDate) {
      startOfPeriod = new Date(fromDate);
      startOfPeriod.setHours(0, 0, 0, 0);
      endOfPeriod = new Date(toDate);
      endOfPeriod.setHours(23, 59, 59, 999);
    } else if (date) {
      const selectedDate = new Date(date);
      startOfPeriod = new Date(selectedDate.setHours(0, 0, 0, 0));
      endOfPeriod = new Date(selectedDate.setHours(23, 59, 59, 999));
    } else {
      return res.status(400).json({ success: false, message: 'Date or date range (fromDate and toDate) is required' });
    }
    
    const pipeline = [
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $match: {
          ...(program && { 'student.programName': program }),
          ...(year && { 'student.year': parseInt(year) }),
          ...(semester && { 'semester': semester }),
          'paymentHistory': { $exists: true, $ne: [] },
          'paymentHistory.paymentDate': {
            $gte: startOfPeriod,
            $lte: endOfPeriod
          }
        }
      },
      { $unwind: '$paymentHistory' },
      {
        $match: {
          'paymentHistory.paymentDate': {
            $gte: startOfPeriod,
            $lte: endOfPeriod
          }
        }
      },
      {
        $project: {
          studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
          studentId: '$student.studentId',
          program: '$student.programName',
          year: '$student.year',
          feeHead: {
            $cond: {
              if: { $ne: ['$feeType', null] },
              then: '$feeType',
              else: {
                $cond: {
                  if: { $gt: [{ $ifNull: ['$totalAmount', 0] }, 50000] },
                  then: 'Tuition Fee',
                  else: 'Other Fees'
                }
              }
            }
          },
          amount: '$paymentHistory.amountPaid',
          paymentMethod: '$paymentHistory.paymentMode',
          transactionId: '$paymentHistory.transactionId',
          receiptNumber: '$paymentHistory.receiptNumber',
          paymentTime: '$paymentHistory.paymentDate',
          status: '$paymentHistory.paymentStatus'
        }
      },
      { $sort: { paymentTime: -1 } }
    ];
    
    const payments = await Fee.aggregate(pipeline);
    
    res.json({
      success: true,
      message: 'Daily payments retrieved successfully',
      data: payments,
      count: payments.length
    });
  } catch (err) {
    next(err);
  }
};

// Daily Department Summary
exports.getDailyDepartmentSummary = async (req, res, next) => {
  try {
    const { fromDate, toDate, date, program } = req.query;
    const Fee = require('../models/Fee');
    
    // Support both single date and date range
    let startOfPeriod, endOfPeriod;
    
    if (fromDate && toDate) {
      startOfPeriod = new Date(fromDate);
      startOfPeriod.setHours(0, 0, 0, 0);
      endOfPeriod = new Date(toDate);
      endOfPeriod.setHours(23, 59, 59, 999);
    } else if (date) {
      const selectedDate = new Date(date);
      startOfPeriod = new Date(selectedDate.setHours(0, 0, 0, 0));
      endOfPeriod = new Date(selectedDate.setHours(23, 59, 59, 999));
    } else {
      return res.status(400).json({ success: false, message: 'Date or date range (fromDate and toDate) is required' });
    }
    
    const pipeline = [
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $match: {
          ...(program && { 'student.programName': program }),
          'paymentHistory': { $exists: true, $ne: [] },
          'paymentHistory.paymentDate': {
            $gte: startOfPeriod,
            $lte: endOfPeriod
          }
        }
      },
      { $unwind: '$paymentHistory' },
      {
        $match: {
          'paymentHistory.paymentDate': {
            $gte: startOfPeriod,
            $lte: endOfPeriod
          }
        }
      },
      {
        $group: {
          _id: {
            program: '$student.programName',
            year: '$student.year'
          },
          totalStudents: { $addToSet: '$studentId' },
          totalCollected: { $sum: '$paymentHistory.amountPaid' },
          totalTransactions: { $sum: 1 }
        }
      },
      {
        $addFields: {
          totalStudents: { $size: '$totalStudents' },
          averagePayment: { $divide: ['$totalCollected', '$totalTransactions'] }
        }
      },
      {
        $project: {
          program: '$_id.program',
          year: '$_id.year',
          totalStudents: 1,
          totalCollected: 1,
          totalTransactions: 1,
          averagePayment: { $round: ['$averagePayment', 2] }
        }
      },
      { $sort: { program: 1, year: 1 } }
    ];
    
    const summary = await Fee.aggregate(pipeline);
    
    res.json({
      success: true,
      message: 'Daily department summary generated successfully',
      data: summary,
      count: summary.length
    });
  } catch (err) {
    next(err);
  }
};

// Daily Payment Methods Summary
exports.getDailyPaymentMethods = async (req, res, next) => {
  try {
    const { fromDate, toDate, date, paymentMethod } = req.query;
    const Fee = require('../models/Fee');
    
    // Support both single date and date range
    let startOfPeriod, endOfPeriod;
    
    if (fromDate && toDate) {
      startOfPeriod = new Date(fromDate);
      startOfPeriod.setHours(0, 0, 0, 0);
      endOfPeriod = new Date(toDate);
      endOfPeriod.setHours(23, 59, 59, 999);
    } else if (date) {
      const selectedDate = new Date(date);
      startOfPeriod = new Date(selectedDate.setHours(0, 0, 0, 0));
      endOfPeriod = new Date(selectedDate.setHours(23, 59, 59, 999));
    } else {
      return res.status(400).json({ success: false, message: 'Date or date range (fromDate and toDate) is required' });
    }
    
    const pipeline = [
      {
        $match: {
          'paymentHistory': { $exists: true, $ne: [] },
          'paymentHistory.paymentDate': {
            $gte: startOfPeriod,
            $lte: endOfPeriod
          }
        }
      },
      { $unwind: '$paymentHistory' },
      {
        $match: {
          'paymentHistory.paymentDate': {
            $gte: startOfPeriod,
            $lte: endOfPeriod
          },
          ...(paymentMethod && { 'paymentHistory.paymentMode': paymentMethod })
        }
      },
      {
        $group: {
          _id: '$paymentHistory.paymentMode',
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$paymentHistory.amountPaid' }
        }
      },
      {
        $addFields: {
          averageAmount: { $divide: ['$totalAmount', '$totalTransactions'] }
        }
      },
      {
        $project: {
          paymentMethod: '$_id',
          totalTransactions: 1,
          totalAmount: 1,
          averageAmount: { $round: ['$averageAmount', 2] }
        }
      }
    ];
    
    const methods = await Fee.aggregate(pipeline);
    
    // Calculate percentages
    const totalAmount = methods.reduce((sum, method) => sum + method.totalAmount, 0);
    const methodsWithPercentage = methods.map(method => ({
      ...method,
      percentage: totalAmount > 0 ? ((method.totalAmount / totalAmount) * 100).toFixed(1) : 0
    }));
    
    res.json({
      success: true,
      message: 'Daily payment methods summary generated successfully',
      data: methodsWithPercentage,
      count: methodsWithPercentage.length
    });
  } catch (err) {
    next(err);
  }
};
