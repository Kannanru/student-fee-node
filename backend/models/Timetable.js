const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  className: { type: String, required: true, trim: true, maxlength: 100 },
  subject: { type: String, required: [true, 'Subject is required'], trim: true, maxlength: 100 },
  room: { type: String, trim: true, maxlength: 50 }, // Deprecated: use hallId instead
  hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', index: true },
  programName: { type: String, required: true, trim: true },
  department: { type: String, trim: true, maxlength: 100 },
  year: { type: Number, required: [true, 'Year is required'], min: 1, max: 6 },
  semester: { type: Number, required: [true, 'Semester is required'], min: 1, max: 12 },
  periodNumber: { type: Number, required: [true, 'Period number is required'], min: 1, max: 10 },
  academicYear: { type: String, required: true, trim: true },
  dayOfWeek: { type: Number, min: 0, max: 6, required: true },
  startTime: { type: String, required: true }, // '08:00'
  endTime: { type: String, required: true },   // '10:00'
  instructor: { type: String, trim: true }, // Deprecated: use facultyId instead
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  facultyName: { type: String, trim: true, maxlength: 100 },
  capacity: { type: Number, min: 0 },
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  isActive: { type: Boolean, default: true },
  effectiveFrom: { type: Date, default: Date.now },
  effectiveTo: { type: Date },
  notes: { type: String, trim: true, maxlength: 500 }
}, { timestamps: true });

timetableSchema.index({ programName: 1, academicYear: 1, dayOfWeek: 1, className: 1 });
timetableSchema.index({ year: 1, semester: 1, programName: 1 });
timetableSchema.index({ hallId: 1, dayOfWeek: 1, isActive: 1 });
timetableSchema.index({ facultyId: 1, dayOfWeek: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);

