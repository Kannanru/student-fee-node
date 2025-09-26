require('dotenv').config();
const mongoose = require('mongoose');
const Timetable = require('../models/Timetable');
const Student = require('../models/Student');

(async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
    await mongoose.connect(uri);

    const student = await Student.findOne({ email: 'student@example.com' });
    const studentId = student ? student._id : null;

    const entries = [
      { className: 'Anatomy 101', room: 'A-101', programName: 'MBBS', academicYear: '2025-2026', dayOfWeek: 5, startTime: '08:00', endTime: '10:00', studentIds: studentId ? [studentId] : [] },
      { className: 'Biochemistry 101', room: 'B-202', programName: 'MBBS', academicYear: '2025-2026', dayOfWeek: 4, startTime: '08:00', endTime: '10:00', studentIds: studentId ? [studentId] : [] }
    ];

    for (const e of entries) {
      await Timetable.updateOne({ className: e.className, programName: e.programName, academicYear: e.academicYear, dayOfWeek: e.dayOfWeek }, e, { upsert: true });
    }

    console.log('Timetable seeded');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
