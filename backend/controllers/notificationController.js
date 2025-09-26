// controllers/notificationController.js
const NotificationLog = require('../models/NotificationLog');

exports.send = async (req, res) => {
  try {
    const log = new NotificationLog(req.body);
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send notification', error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const logs = await NotificationLog.find();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
};
