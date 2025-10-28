const mongoose = require('mongoose');

const paymentOrderSchema = new mongoose.Schema({
  provider: { type: String, enum: ['Razorpay'], default: 'Razorpay' },
  orderId: { type: String, required: true, unique: true },
  feeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee', required: false }, // Optional for fee collection flow
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // Added for fee collection
  amount: { type: Number, required: true }, // in paise for Razorpay
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
  meta: { type: Object }
}, { timestamps: true });

paymentOrderSchema.index({ feeId: 1, orderId: 1 });

module.exports = mongoose.model('PaymentOrder', paymentOrderSchema);
