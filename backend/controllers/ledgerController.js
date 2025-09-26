// controllers/ledgerController.js
const LedgerEntry = require('../models/LedgerEntry');

exports.getByStudent = async (req, res) => {
  try {
    const entries = await LedgerEntry.find({ studentId: req.params.studentId });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ledger', error: err.message });
  }
};
