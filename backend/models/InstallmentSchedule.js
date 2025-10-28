// models/InstallmentSchedule.js
const mongoose = require('mongoose');

const installmentScheduleSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  mode: { type: String, enum: ['full', '2', '4'], required: true },
  items: [{
    installmentId: String,
    seq: Number,
    dueDate: Date,
    amount: Number,
    status: { type: String, enum: ['due', 'paid', 'overdue'], default: 'due' }
  }],
  nextDueInstallmentId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('InstallmentSchedule', installmentScheduleSchema);
