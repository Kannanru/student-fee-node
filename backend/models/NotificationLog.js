// models/NotificationLog.js
const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  type: { type: String, enum: ['sms', 'push', 'email'], required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  ts: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
