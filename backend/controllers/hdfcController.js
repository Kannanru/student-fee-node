const crypto = require('crypto');
const Fee = require('../models/Fee');
const Student = require('../models/Student');

// NOTE: Placeholder HDFC integration. Replace signature logic per HDFC kit.
function generateChecksum(payload, secret) {
  return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
}

exports.initiate = async (req, res, next) => {
  try {
    const { studentId, feeId, amount, redirectUrl } = req.body;
    if (!studentId || !feeId || !amount || !redirectUrl) {
      return res.status(400).json({ success: false, message: 'studentId, feeId, amount, redirectUrl are required' });
    }
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });
    if (amount > fee.dueAmount) return res.status(400).json({ success: false, message: `Amount exceeds due (${fee.dueAmount})` });

    const merchantId = process.env.HDFC_MERCHANT_ID || 'DEMO_MID';
    const secret = process.env.HDFC_SECRET || 'DEMO_SECRET';

    const orderId = `ORD_${feeId}_${Date.now()}`;
    const payload = {
      merchantId,
      orderId,
      amount,
      currency: 'INR',
      customerEmail: student.email,
      customerPhone: student.contactNumber,
      redirectUrl,
      feeId,
      studentId
    };

    const checksum = generateChecksum(payload, secret);

    // In a real integration, you may redirect to hosted payment page or return a form/URL
    res.json({ success: true, message: 'HDFC payment initiated', data: { paymentUrl: `${process.env.HDFC_GATEWAY_URL || 'https://hdfc.example.com/pay'}`, payload, checksum } });
  } catch (err) { next(err); }
};

exports.callback = async (req, res, next) => {
  try {
    const secret = process.env.HDFC_SECRET || 'DEMO_SECRET';
    const { payload, checksum } = req.body; // Expect gateway to POST back
    if (!payload || !checksum) return res.status(400).json({ success: false, message: 'Invalid callback payload' });
    const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    if (expected !== checksum) return res.status(400).json({ success: false, message: 'Checksum mismatch' });

    // Update Fee payment record based on payload.status
    const fee = await Fee.findById(payload.feeId);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });

    if (payload.status === 'SUCCESS') {
      const amountPaid = Number(payload.amount) || 0;
      const transactionId = payload.transactionId || `HDFC_${Date.now()}`;
      const receiptNumber = payload.receiptNumber || `RCP_${Date.now()}`;
      fee.paidAmount += amountPaid;
      fee.dueAmount = Math.max(0, fee.totalAmount + fee.penaltyAmount - fee.paidAmount);
      fee.paymentHistory.push({ paymentDate: new Date(), amountPaid, paymentMode: 'Net Banking', transactionId, receiptNumber, paymentStatus: 'Successful', balanceAfterPayment: fee.dueAmount, paymentGateway: 'HDFC', gatewayTransactionId: payload.gatewayTransactionId });
      await fee.save();
    }

    // Respond as per gateway requirement
    res.json({ success: true, message: 'Callback processed' });
  } catch (err) { next(err); }
};
