const paymentService = require('../services/payment.service');
const mongoose = require('mongoose');


exports.list = async (req, res) => {
  try {
    const payments = await paymentService.listPayments();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments', error: err.message });
  }
};

exports.listAll = async (req, res) => {
  try {
    const filters = req.query || {};
    const payments = await paymentService.listPayments(filters);
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const payment = await paymentService.createPayment(req.body);
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create payment', error: err.message });
  }
};

exports.createFeePayment = async (req, res, next) => {
  try {
    const Payment = require('../models/Payment');
    const Student = require('../models/Student');
    const FeeHead = require('../models/FeeHead');
    
    const { 
      studentId, 
      selectedFeeHeads, 
      paymentMode, 
      bankName, 
      chequeNumber, 
      chequeDate, 
      transactionId, 
      remarks,
      fineAmount = 0,
      daysDelayed = 0,
      finePerDay = 0,
      totalAmountWithFine
    } = req.body;
    
    // Validate required fields
    if (!studentId || !selectedFeeHeads || selectedFeeHeads.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student ID and at least one fee head are required' 
      });
    }
    
    if (!paymentMode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment mode is required' 
      });
    }
    
    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Get fee heads details
    const feeHeads = await FeeHead.find({ _id: { $in: selectedFeeHeads } });
    if (feeHeads.length !== selectedFeeHeads.length) {
      return res.status(404).json({ success: false, message: 'One or more fee heads not found' });
    }
    
    // Calculate total amount
    const totalAmount = feeHeads.reduce((sum, head) => sum + head.amount, 0);
    
    // Build headsPaid array
    const headsPaid = feeHeads.map(head => ({
      headId: head._id,
      headCode: head.code,
      headName: head.name,
      amount: head.amount
    }));
    
    // Generate receipt number
    const receiptNumber = await generateReceiptNumber();
    
    // Build payment data
    const paymentData = {
      receiptNumber,
      studentId: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      registerNumber: student.studentId || student.enrollmentNumber,
      // billId/billNumber: will be attached by billing flow; keep undefined if not available
      amount: totalAmount,
      fineAmount: fineAmount,
      daysDelayed: daysDelayed,
      finePerDay: finePerDay,
      totalAmountWithFine: totalAmountWithFine || (totalAmount + fineAmount),
      currency: 'INR',
      paymentMode,
      headsPaid,
      remarks: remarks || '',
      status: 'confirmed',
      paymentDate: new Date(),
      collectedBy: req.user?.id || req.user?._id, // From auth middleware
      // Academic context
      academicYear: student.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear()+1}`,
      semester: student.semester || undefined,
      quota: student.quota || undefined
    };
    
    // Add mode-specific details
    switch (paymentMode) {
      case 'bank-transfer':
      case 'online':
        if (transactionId) {
          paymentData.onlinePaymentDetails = {
            transactionId,
            gatewayName: bankName || 'Manual Entry'
          };
        }
        if (bankName) {
          paymentData.bankTransferDetails = {
            bankName,
            referenceNumber: transactionId || ''
          };
        }
        break;
        
      case 'cheque':
        if (chequeNumber) {
          paymentData.chequeDetails = {
            chequeNumber,
            chequeDate: chequeDate ? new Date(chequeDate) : new Date(),
            bankName: bankName || '',
            status: 'cleared' // Assuming cleared for now
          };
        }
        break;
        
      case 'upi':
        if (transactionId) {
          paymentData.upiDetails = {
            transactionId,
            upiId: bankName || '' // Using bankName field for UPI ID if provided
          };
        }
        break;
        
      case 'dd':
        if (chequeNumber) { // Reusing cheque number field for DD number
          paymentData.ddDetails = {
            ddNumber: chequeNumber,
            ddDate: chequeDate ? new Date(chequeDate) : new Date(),
            bankName: bankName || '',
            status: 'cleared'
          };
        }
        break;
    }
    
    // Create payment record
    const payment = await Payment.create(paymentData);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Fee payment recorded successfully', 
      data: payment 
    });
  } catch (err) {
    console.error('Fee payment error:', err);
    next(err);
  }
};

// Helper function to generate receipt number
async function generateReceiptNumber() {
  const Payment = require('../models/Payment');
  const year = new Date().getFullYear();
  const prefix = `RCP-${year}-`;
  
  // Find the last receipt number for this year
  const lastPayment = await Payment.findOne({ 
    receiptNumber: { $regex: `^${prefix}` } 
  }).sort({ createdAt: -1 });
  
  let nextNumber = 1;
  if (lastPayment && lastPayment.receiptNumber) {
    const lastNumber = parseInt(lastPayment.receiptNumber.split('-')[2]);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }
  
  return `${prefix}${String(nextNumber).padStart(5, '0')}`;
}

// New collect fee endpoint
exports.collectFee = async (req, res, next) => {
  try {
    const Payment = require('../models/Payment');
    const Invoice = require('../models/Invoice');
    const Student = require('../models/Student');
    const FeePlan = require('../models/FeePlan');
    const FeeHead = require('../models/FeeHead');
    const StudentBill = require('../models/StudentBill');
    
    const { 
      studentId, 
      feeStructureId,
      feeHeads, // Array of { headId, amount }
      totalAmount,
      paymentMode, 
      paymentReference,
      transactionId,
      bankName, 
      chequeNumber, 
      chequeDate, 
      remarks 
    } = req.body;
    
    console.log('Collect fee request:', { studentId, feeStructureId, feeHeads: feeHeads?.length, totalAmount });
    
    // Validate required fields
    if (!studentId || !feeStructureId || !feeHeads || feeHeads.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student ID, Fee Structure ID, and at least one fee head are required' 
      });
    }
    
    if (!paymentMode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment mode is required' 
      });
    }
    
    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get fee structure
    const feeStructure = await FeePlan.findById(feeStructureId).populate('heads.headId');
    if (!feeStructure) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }
    
    // Validate fee heads belong to this structure
    const structureHeadIds = new Set(
      feeStructure.heads.map(h => (h.headId._id || h.headId).toString())
    );
    
    for (const feeHead of feeHeads) {
      if (!structureHeadIds.has(feeHead.headId.toString())) {
        return res.status(400).json({ 
          success: false, 
          message: `Fee head ${feeHead.headId} does not belong to this fee structure` 
        });
      }
    }
    
    // Generate receipt number
    const receiptNumber = await generateReceiptNumber();
    
    // Generate bill number using proper method
    const billNumber = await StudentBill.generateBillNumber();
    
    // Create StudentBill first
    const billData = {
      billNumber,
      studentId: student._id,
      studentName: student.name || `${student.firstName} ${student.lastName}`,
      registerNumber: student.studentId || student.enrollmentNumber,
      academicYear: student.academicYear || feeStructure.academicYear,
      program: student.programName || feeStructure.program,
      department: student.department || 'General',
      year: student.year || feeStructure.year,
      semester: student.semester || feeStructure.semester,
      quota: student.quota || feeStructure.quota,
      planId: feeStructure._id,
      planCode: feeStructure.planCode || `PLAN-${feeStructure._id}`,
      planVersion: feeStructure.version || 1,
      heads: feeHeads.map(fh => {
        const structureHead = feeStructure.heads.find(
          h => (h.headId._id || h.headId).toString() === fh.headId.toString()
        );
        const headData = structureHead?.headId || {};
        
        return {
          headId: fh.headId,
          headCode: headData.code || `HEAD-${fh.headId}`,
          headName: headData.name || 'Fee Head',
          amount: fh.amount,
          taxPercentage: structureHead?.taxPercentage || 0,
          taxAmount: structureHead?.taxAmount || 0,
          totalAmount: fh.amount,
          paidAmount: fh.amount,
          balanceAmount: 0
        };
      }),
      totalAmount: totalAmount,
      paidAmount: totalAmount,
      balanceAmount: 0,
      status: 'paid',
      billDate: new Date(),
      dueDate: new Date(),
      paidDate: new Date()
    };
    
    const bill = await StudentBill.create(billData);
    console.log('StudentBill created:', bill._id);
    
    // Create payment record
    const paymentData = {
      receiptNumber,
      studentId: student._id,
      studentName: student.name || `${student.firstName} ${student.lastName}`,
      registerNumber: student.studentId || student.enrollmentNumber,
      billId: bill._id,
      billNumber: bill.billNumber,
      academicYear: student.academicYear || feeStructure.academicYear,
      semester: student.semester || feeStructure.semester,
      quota: student.quota || feeStructure.quota,
      amount: totalAmount,
      currency: 'INR',
      paymentMode,
      paymentReference: paymentReference || '',
      remarks: remarks || '',
      status: 'confirmed',
      paymentDate: new Date(),
      collectedBy: req.user?.id || req.user?._id,
      feeHeadIds: feeHeads.map(h => h.headId)
    };
    
    // Add mode-specific details
    if (paymentMode === 'bank_transfer' || paymentMode === 'online') {
      paymentData.transactionId = transactionId;
      paymentData.bankName = bankName;
    } else if (paymentMode === 'cheque' || paymentMode === 'dd') {
      paymentData.chequeNumber = chequeNumber;
      paymentData.chequeDate = chequeDate;
      paymentData.bankName = bankName;
    }
    
    const payment = await Payment.create(paymentData);
    console.log('Payment created:', payment._id);
    
    // Create invoices - one for each fee head
    const invoices = [];
    for (const fh of feeHeads) {
      const invoiceData = {
        studentId: student._id,
        feeHeadId: fh.headId,
        amount: fh.amount,
        issueDate: new Date(),
        dueDate: new Date(),
        status: 'paid'
      };
      
      const invoice = await Invoice.create(invoiceData);
      invoices.push(invoice);
      console.log('Invoice created:', invoice._id);
    }
    
    return res.status(201).json({ 
      success: true, 
      message: 'Fee collected successfully', 
      data: {
        payment: {
          _id: payment._id,
          receiptNumber: payment.receiptNumber,
          billNumber: payment.billNumber,
          amount: payment.amount,
          paymentMode: payment.paymentMode,
          paymentDate: payment.paymentDate,
          status: payment.status
        },
        invoices,
        bill,
        receiptNumber,
        paymentId: payment._id  // For PDF download
      }
    });
  } catch (err) {
    console.error('Collect fee error:', err);
    next(err);
  }
};
