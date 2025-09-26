const Timetable = require('../models/Timetable');

exports.create = async (req, res, next) => {
  try {
    const required = ['className','programName','academicYear','dayOfWeek','startTime','endTime'];
    const missing = required.filter(f => !req.body[f]);
    if (missing.length) return res.status(400).json({ success: false, message: 'Missing required fields', fields: missing });
    const doc = await Timetable.create(req.body);
    res.status(201).json({ success: true, message: 'Timetable created', data: doc });
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const { programName, academicYear, dayOfWeek, className } = req.query;
    const q = {};
    if (programName) q.programName = programName;
    if (academicYear) q.academicYear = academicYear;
    if (dayOfWeek != null) q.dayOfWeek = parseInt(dayOfWeek);
    if (className) q.className = className;
    const items = await Timetable.find(q).sort({ dayOfWeek: 1, startTime: 1 });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

exports.getByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const items = await Timetable.find({ studentIds: studentId }).sort({ dayOfWeek: 1, startTime: 1 });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Timetable.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Timetable not found' });
    res.json({ success: true, message: 'Timetable updated', data: doc });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Timetable.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Timetable not found' });
    res.json({ success: true, message: 'Timetable deleted' });
  } catch (err) { next(err); }
};
