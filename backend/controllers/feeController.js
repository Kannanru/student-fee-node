const Fee = require('../models/Fee');
const Student = require('../models/Student');
const PenaltyConfig = require('../models/PenaltyConfig');

exports.createFeeStructure = async (req, res, next) => {
  try {
    const { studentId, academicYear, semester, feeBreakdown, dueDate } = req.body;
    if (!studentId || !academicYear || !semester || !feeBreakdown || !dueDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const duplicate = await Fee.findOne({ studentId, academicYear, semester });
    if (duplicate) return res.status(409).json({ success: false, message: 'Fee structure already exists for student/year/semester' });
    const { tuitionFee, semesterFee } = feeBreakdown;
    if (tuitionFee == null || semesterFee == null) return res.status(400).json({ success: false, message: 'tuitionFee and semesterFee are required' });
    const fee = new Fee({ studentId, academicYear, semester, feeBreakdown, totalAmount: 0, dueAmount: 0, dueDate });
    await fee.save();
    const populated = await Fee.findById(fee._id).populate('studentId','firstName lastName studentId enrollmentNumber programName');
    res.status(201).json({ success: true, message: 'Fee structure created successfully', data: populated });
  } catch (err) { next(err); }
};

exports.getStudentFeeDetails = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { academicYear, semester } = req.query;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const q = { studentId };
    if (academicYear) q.academicYear = academicYear;
    if (semester) q.semester = semester;
    const fees = await Fee.find(q).sort({ updatedAt: -1 });
    // Optionally apply penalty if overdue
    const config = await PenaltyConfig.findOne({ academicYear: academicYear || student.academicYear, isActive: true });
    const response = await Promise.all(fees.map(async (f) => {
      let penaltyApplied = f.penaltyAmount;
      if (config && f.dueAmount > 0 && new Date() > f.dueDate) {
        const days = Math.floor((new Date() - new Date(f.dueDate)) / (1000*60*60*24));
        penaltyApplied = config.calculatePenalty(f.dueAmount, days);
      }
      return {
        studentInfo: {
          studentName: `${student.firstName} ${student.lastName}`.trim(),
          studentId: student.studentId,
          courseGroup: student.programName,
          yearBatch: f.academicYear,
          enrollmentNumber: student.enrollmentNumber
        },
        feeDueSection: {
          currentDueAmount: f.dueAmount + (penaltyApplied || 0),
          feeBreakdown: f.feeBreakdown,
          totalDueAmount: f.totalAmount,
          penaltyAmount: penaltyApplied || 0,
          dueDate: f.dueDate,
          isOverdue: new Date() > f.dueDate && f.dueAmount > 0,
          status: f.status
        },
        paymentHistory: f.paymentHistory.map(p => ({
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
        feeId: f._id,
        academicYear: f.academicYear,
        semester: f.semester,
        lastUpdated: f.updatedAt
      };
    }));
    res.json({ success: true, message: 'Student fee details retrieved successfully', data: response });
  } catch (err) { next(err); }
};

exports.processPayment = async (req, res, next) => {
  try {
    const { feeId } = req.params;
    const { amountPaid, paymentMode, transactionId, receiptNumber, paymentGateway, gatewayTransactionId } = req.body;
    if (!amountPaid || !paymentMode || !transactionId || !receiptNumber) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });
    if (amountPaid > fee.dueAmount) return res.status(400).json({ success: false, message: 'Payment amount cannot exceed due amount', error: { field: 'amountPaid', message: `Maximum payable amount is ${fee.dueAmount}` } });
    const txnExists = await Fee.findOne({ 'paymentHistory.transactionId': transactionId });
    if (txnExists) return res.status(409).json({ success: false, message: 'Duplicate transactionId' });
    fee.paidAmount += amountPaid;
    fee.dueAmount = Math.max(0, fee.totalAmount + fee.penaltyAmount - fee.paidAmount);
    fee.paymentHistory.push({ paymentDate: new Date(), amountPaid, paymentMode, transactionId, receiptNumber, paymentStatus: 'Successful', balanceAfterPayment: fee.dueAmount, paymentGateway, gatewayTransactionId });
    await fee.save();
    const updated = await Fee.findById(fee._id).populate('studentId','firstName lastName studentId enrollmentNumber');
    res.json({ success: true, message: 'Payment processed successfully', data: { feeRecord: { _id: updated._id, studentId: updated.studentId, totalAmount: updated.totalAmount, paidAmount: updated.paidAmount, dueAmount: updated.dueAmount, status: updated.status }, paymentDetails: updated.paymentHistory[updated.paymentHistory.length - 1], remainingBalance: updated.dueAmount } });
  } catch (err) { next(err); }
};

exports.getPaymentHistory = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10, academicYear } = req.query;
    const feeQuery = { studentId };
    if (academicYear) feeQuery.academicYear = academicYear;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const fees = await Fee.find(feeQuery).sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit));
    const flattened = fees.flatMap(f => f.paymentHistory.map(p => ({
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
    })));
    res.json({ success: true, message: 'Payment history retrieved successfully', data: flattened, pagination: { currentPage: parseInt(page), totalPages: 1, totalPayments: flattened.length } });
  } catch (err) { next(err); }
};
