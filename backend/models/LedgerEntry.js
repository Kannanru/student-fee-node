// models/LedgerEntry.js
const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  type: { type: String, enum: ['charge', 'payment', 'refund', 'concession'], required: true },
  refId: { type: mongoose.Schema.Types.ObjectId },
  amount: { type: Number, required: true },
  ts: { type: Date, default: Date.now },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);
