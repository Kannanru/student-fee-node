// models/Invoice.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  feeHeadId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeHead', required: true },
  amount: { type: Number, required: true },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['due', 'installment_due', 'overdue', 'paid'], default: 'due' },
  penalties: [{ type: Number }],
  concessions: [{ type: Number }],
  notes: { type: String },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'InstallmentSchedule' }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
