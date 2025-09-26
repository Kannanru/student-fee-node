// models/FeeHead.js
const mongoose = require('mongoose');

const feeHeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  taxability: { type: Boolean, default: false },
  glCode: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('FeeHead', feeHeadSchema);
