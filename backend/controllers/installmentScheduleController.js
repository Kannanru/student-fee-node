// controllers/installmentScheduleController.js
const InstallmentSchedule = require('../models/InstallmentSchedule');

exports.list = async (req, res) => {
  try {
    const schedules = await InstallmentSchedule.find();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch schedules', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const schedule = new InstallmentSchedule(req.body);
    await schedule.save();
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create schedule', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const schedule = await InstallmentSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!schedule) return res.status(404).json({ message: 'Not found' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update schedule', error: err.message });
  }
};
