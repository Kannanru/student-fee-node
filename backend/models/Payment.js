// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  installmentId: { type: String },
  method: { type: String, enum: ['upi', 'card', 'netbanking'], required: true },
  pgRef: { type: String },
  amount: { type: Number, required: true },
  ts: { type: Date, default: Date.now },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
  fees: { type: Number },
  netSettlement: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
