const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  className: { type: String, required: true, trim: true, maxlength: 100 },
  room: { type: String, trim: true, maxlength: 50 },
  programName: { type: String, required: true, trim: true },
  academicYear: { type: String, required: true, trim: true },
  dayOfWeek: { type: Number, min: 0, max: 6, required: true },
  startTime: { type: String, required: true }, // '08:00'
  endTime: { type: String, required: true },   // '10:00'
  instructor: { type: String, trim: true },
  capacity: { type: Number, min: 0 },
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

timetableSchema.index({ programName: 1, academicYear: 1, dayOfWeek: 1, className: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
