// controllers/auditController.js
const AuditLog = require('../models/AuditLog');

exports.list = async (req, res) => {
  try {
    const logs = await AuditLog.find();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch audit logs', error: err.message });
  }
};
