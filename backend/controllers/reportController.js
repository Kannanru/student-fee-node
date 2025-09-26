// controllers/reportController.js
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Refund = require('../models/Refund');
const Student = require('../models/Student');

exports.collections = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'success' });
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ total, payments });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch collections', error: err.message });
  }
};

exports.duesAging = async (req, res) => {
  try {
    const invoices = await Invoice.find({ status: { $in: ['due', 'overdue'] } });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dues aging', error: err.message });
  }
};

exports.scholarships = async (req, res) => {
  try {
    // Placeholder: return students with concessions
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch scholarships', error: err.message });
  }
};

exports.refunds = async (req, res) => {
  try {
    const refunds = await Refund.find({ status: 'approved' });
    res.json(refunds);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch refunds report', error: err.message });
  }
};
