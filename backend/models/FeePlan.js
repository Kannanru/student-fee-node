// models/FeePlan.js
const mongoose = require('mongoose');

const feePlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  program: { type: String, required: true },
  semester: { type: String, required: true },
  mode: { type: String, enum: ['full', '2', '4'], required: true },
  heads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FeeHead' }],
  amounts: [{ head: String, amount: Number }],
  dueDates: [{ seq: Number, dueDate: Date, amount: Number }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('FeePlan', feePlanSchema);
