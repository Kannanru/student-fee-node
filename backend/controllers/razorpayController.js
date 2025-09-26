const Razorpay = require('razorpay');
const crypto = require('crypto');
const Fee = require('../models/Fee');
const PaymentOrder = require('../models/PaymentOrder');

function getClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET in env');
  }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

exports.createOrder = async (req, res, next) => {
  try {
    const { feeId, amount, currency = 'INR', receipt } = req.body;
    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });
    if (amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    const client = getClient();
  const order = await client.orders.create({ amount: Math.round(amount * 100), currency, receipt: receipt || `FEE_${feeId}_${Date.now()}` });
  await PaymentOrder.create({ orderId: order.id, feeId, amount: order.amount, currency: order.currency, status: order.status || 'created', meta: order });
  res.status(201).json({ success: true, data: order });
  } catch (err) { next(err); }
};

exports.verifySignature = async (req, res, next) => {
  try {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, feeId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    const valid = expected === razorpay_signature;
    if (!valid) return res.status(400).json({ success: false, message: 'Invalid signature' });

    // Update PaymentOrder and Fee balances
    const po = await PaymentOrder.findOne({ orderId: razorpay_order_id });
    if (po) {
      po.status = 'paid';
      await po.save();
    }
    if (feeId) {
      const fee = await Fee.findById(feeId);
      if (fee) {
        const amountPaid = po ? (po.amount/100) : fee.dueAmount; // use order amount (paise->INR)
        fee.paidAmount += amountPaid;
        fee.dueAmount = Math.max(0, (fee.totalAmount + (fee.penaltyAmount||0)) - fee.paidAmount);
        fee.paymentHistory.push({
          paymentDate: new Date(),
          amountPaid,
          paymentMode: 'Online',
          transactionId: razorpay_payment_id,
          receiptNumber: razorpay_order_id,
          paymentStatus: 'Successful',
          balanceAfterPayment: fee.dueAmount,
          paymentGateway: 'Razorpay',
          gatewayTransactionId: razorpay_payment_id
        });
        await fee.save();
      }
    }

    res.json({ success: true, message: 'Signature verified' });
  } catch (err) { next(err); }
};
