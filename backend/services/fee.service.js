const BaseService = require('./base.service');
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const PenaltyConfig = require('../models/PenaltyConfig');

class FeeService extends BaseService {
  constructor() {
    super(Fee);
  }

  /**
   * Create fee structure for student
   * @param {Object} feeData - { studentId, academicYear, semester, feeBreakdown, dueDate }
   * @returns {Promise<Object>}
   */
  async createFeeStructure(feeData) {
    const { studentId, academicYear, semester, feeBreakdown, dueDate } = feeData;
    
    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Check for duplicate fee structure
    const duplicate = await Fee.findOne({ studentId, academicYear, semester });
    if (duplicate) {
      throw new Error('Fee structure already exists for student/year/semester');
    }

    // Validate fee breakdown
    const { tuitionFee, semesterFee } = feeBreakdown;
    if (tuitionFee == null || semesterFee == null) {
      throw new Error('tuitionFee and semesterFee are required');
    }

    // Create fee record
    const fee = new Fee({
      studentId,
      academicYear,
      semester,
      feeBreakdown,
      totalAmount: 0,
      dueAmount: 0,
      dueDate
    });

    await fee.save();

    // Return populated data
    return await Fee.findById(fee._id)
      .populate('studentId', 'firstName lastName studentId enrollmentNumber programName');
  }

  /**
   * Get student fee details with penalty calculations
   * @param {String} studentId
   * @param {Object} filters - { academicYear, semester }
   * @returns {Promise<Array>}
   */
  async getStudentFeeDetailsWithPenalty(studentId, filters = {}) {
    // Validate student
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Build query
    const query = { studentId };
    if (filters.academicYear) query.academicYear = filters.academicYear;
    if (filters.semester) query.semester = filters.semester;

    // Get fees
    const fees = await Fee.find(query).sort({ updatedAt: -1 });

    // Get penalty config
    const config = await PenaltyConfig.findOne({
      academicYear: filters.academicYear || student.academicYear,
      isActive: true
    });

    // Process each fee record
    const response = fees.map(fee => {
      let penaltyApplied = fee.penaltyAmount;

      // Calculate penalty if overdue
      if (config && fee.dueAmount > 0 && new Date() > fee.dueDate) {
        const days = Math.floor((new Date() - new Date(fee.dueDate)) / (1000 * 60 * 60 * 24));
        penaltyApplied = config.calculatePenalty(fee.dueAmount, days);
      }

      return {
        studentInfo: {
          studentName: `${student.firstName} ${student.lastName}`.trim(),
          studentId: student.studentId,
          courseGroup: student.programName,
          yearBatch: fee.academicYear,
          enrollmentNumber: student.enrollmentNumber
        },
        feeDueSection: {
          currentDueAmount: fee.dueAmount + (penaltyApplied || 0),
          feeBreakdown: fee.feeBreakdown,
          totalDueAmount: fee.totalAmount,
          penaltyAmount: penaltyApplied || 0,
          dueDate: fee.dueDate,
          isOverdue: new Date() > fee.dueDate && fee.dueAmount > 0,
          status: fee.status
        },
        paymentHistory: fee.paymentHistory.map(p => ({
          paymentDate: p.paymentDate,
          amountPaid: p.amountPaid,
          modeOfPayment: p.paymentMode,
          transactionId: p.transactionId,
          receiptNumber: p.receiptNumber,
          paymentStatus: p.paymentStatus,
          balanceAfterPayment: p.balanceAfterPayment,
          paymentGateway: p.paymentGateway,
          gatewayTransactionId: p.gatewayTransactionId
        })),
        feeId: fee._id,
        academicYear: fee.academicYear,
        semester: fee.semester,
        lastUpdated: fee.updatedAt
      };
    });

    return response;
  }

  /**
   * Process payment for fee
   * @param {String} feeId
   * @param {Object} paymentData - { amountPaid, paymentMode, transactionId, receiptNumber, paymentGateway, gatewayTransactionId }
   * @returns {Promise<Object>}
   */
  async processPayment(feeId, paymentData) {
    const { amountPaid, paymentMode, transactionId, receiptNumber, paymentGateway, gatewayTransactionId } = paymentData;

    // Get fee record
    const fee = await Fee.findById(feeId);
    if (!fee) {
      throw new Error('Fee record not found');
    }

    // Validate payment amount
    if (amountPaid > fee.dueAmount) {
      const error = new Error('Payment amount cannot exceed due amount');
      error.field = 'amountPaid';
      error.maxAmount = fee.dueAmount;
      throw error;
    }

    // Check for duplicate transaction
    const txnExists = await Fee.findOne({ 'paymentHistory.transactionId': transactionId });
    if (txnExists) {
      throw new Error('Duplicate transactionId');
    }

    // Update fee amounts
    fee.paidAmount += amountPaid;
    fee.dueAmount = Math.max(0, fee.totalAmount + fee.penaltyAmount - fee.paidAmount);

    // Add payment to history
    fee.paymentHistory.push({
      paymentDate: new Date(),
      amountPaid,
      paymentMode,
      transactionId,
      receiptNumber,
      paymentStatus: 'Successful',
      balanceAfterPayment: fee.dueAmount,
      paymentGateway,
      gatewayTransactionId
    });

    await fee.save();

    // Return populated data
    const updated = await Fee.findById(fee._id)
      .populate('studentId', 'firstName lastName studentId enrollmentNumber');

    return {
      feeRecord: {
        _id: updated._id,
        studentId: updated.studentId,
        totalAmount: updated.totalAmount,
        paidAmount: updated.paidAmount,
        dueAmount: updated.dueAmount,
        status: updated.status
      },
      paymentDetails: updated.paymentHistory[updated.paymentHistory.length - 1],
      remainingBalance: updated.dueAmount
    };
  }

  /**
   * Get payment history for student
   * @param {String} studentId
   * @param {Object} options - { page, limit, academicYear }
   * @returns {Promise<Object>}
   */
  async getPaymentHistory(studentId, options = {}) {
    const { page = 1, limit = 10, academicYear } = options;

    // Build query
    const feeQuery = { studentId };
    if (academicYear) feeQuery.academicYear = academicYear;

    // Get fees with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const fees = await Fee.find(feeQuery)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Flatten payment history
    const flattened = fees.flatMap(f => 
      f.paymentHistory.map(p => ({
        paymentDate: p.paymentDate,
        amountPaid: p.amountPaid,
        paymentMode: p.paymentMode,
        transactionId: p.transactionId,
        receiptNumber: p.receiptNumber,
        paymentStatus: p.paymentStatus,
        balanceAfterPayment: p.balanceAfterPayment,
        paymentGateway: p.paymentGateway,
        gatewayTransactionId: p.gatewayTransactionId,
        academicYear: f.academicYear,
        semester: f.semester
      }))
    );

    return {
      payments: flattened,
      pagination: {
        currentPage: parseInt(page),
        totalPages: 1,
        totalPayments: flattened.length
      }
    };
  }

  /**
   * Get pending fees for student
   * @param {String} studentId
   * @returns {Promise<Array>}
   */
  async getPendingFees(studentId) {
    return await this.find({
      student: studentId,
      status: 'pending'
    }, {
      populate: ['feeHead', 'installmentSchedule'],
      sort: { dueDate: 1 }
    });
  }

  /**
   * Get overdue fees
   * @param {String} studentId
   * @returns {Promise<Array>}
   */
  async getOverdueFees(studentId = null) {
    const filters = {
      status: 'pending',
      dueDate: { $lt: new Date() }
    };
    
    if (studentId) {
      filters.student = studentId;
    }
    
    return await this.find(filters, {
      populate: ['student', 'feeHead'],
      sort: { dueDate: 1 }
    });
  }

  /**
   * Get fee statistics
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async getStatistics(filters = {}) {
    const stats = await this.Model.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    const result = {
      pending: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 },
      overdue: { count: 0, amount: 0 },
      total: { count: 0, amount: 0 }
    };
    
    stats.forEach(stat => {
      if (stat._id && result.hasOwnProperty(stat._id)) {
        result[stat._id].count = stat.count;
        result[stat._id].amount = stat.totalAmount;
      }
      result.total.count += stat.count;
      result.total.amount += stat.totalAmount;
    });
    
    return result;
  }
}

module.exports = new FeeService();
