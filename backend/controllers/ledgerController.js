const ledgerService = require('../services/ledger.service');

exports.getByStudent = async (req, res) => {
  try {
    const entries = await ledgerService.getEntriesByStudent(req.params.studentId);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ledger', error: err.message });
  }
};
