const installmentScheduleService = require('../services/installmentSchedule.service');

exports.list = async (req, res) => {
  try {
    const schedules = await installmentScheduleService.listSchedules();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch schedules', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const schedule = await installmentScheduleService.createSchedule(req.body);
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create schedule', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const schedule = await installmentScheduleService.updateSchedule(req.params.id, req.body);
    res.json(schedule);
  } catch (err) {
    if (err.message === 'Installment schedule not found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to update schedule', error: err.message });
  }
};
