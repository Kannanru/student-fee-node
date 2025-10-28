const concessionService = require('../services/concession.service');

exports.list = async (req, res) => {
  try {
    const concessions = await concessionService.listConcessions();
    res.json(concessions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch concessions', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const concession = await concessionService.createConcession(req.body);
    res.status(201).json(concession);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create concession', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const concession = await concessionService.updateConcession(req.params.id, req.body);
    res.json(concession);
  } catch (err) {
    if (err.message === 'Concession not found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to update concession', error: err.message });
  }
};
