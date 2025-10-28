// models/Refund.js
const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  amount: { type: Number, required: true },
  reason: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ts: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Refund', refundSchema);
