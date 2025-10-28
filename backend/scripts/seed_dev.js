require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');

(async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
    await mongoose.connect(uri);

    // Upsert a sample student
    const email = 'student@example.com';
    const password = await bcrypt.hash('Password123', 10);
    let student = await Student.findOne({ email });
    if (!student) {
      student = new Student({
        studentId: 'STU001234',
        enrollmentNumber: 'EN2025001',
        firstName: 'Jane',
        lastName: 'Smith',
        dob: new Date('2005-01-01'),
        gender: 'Female',
        email,
        contactNumber: '9876543210',
        permanentAddress: '123 Main Street, City, State, PIN-123456',
        programName: 'MBBS',
        admissionDate: new Date('2025-09-01'),
        academicYear: '2025-2026',
        guardianName: 'John Smith',
        guardianContact: '9876543211',
        emergencyContactName: 'Mary Smith',
        emergencyContactNumber: '9876543212',
        studentType: 'full-time',
        password
      });
      await student.save();
    }

    // Create fee structure if not exists
    let fee = await Fee.findOne({ studentId: student._id, academicYear: '2025-2026', semester: '1' });
    if (!fee) {
      fee = new Fee({
        studentId: student._id,
        academicYear: '2025-2026',
        semester: '1',
        feeBreakdown: { tuitionFee: 100000, semesterFee: 25000, hostelFee: 0, libraryFee: 0, labFee: 0, otherFees: 0 },
        totalAmount: 0,
        dueAmount: 0,
        dueDate: new Date('2025-10-31')
      });
      await fee.save();
    }

    // Seed attendance examples (Present and Late)
    const baseDate = new Date('2025-09-26');
    const classStart = new Date('2025-09-26T08:00:00.000Z');
    const classEnd = new Date('2025-09-26T10:00:00.000Z');

    await Attendance.updateOne(
      { studentId: student._id, date: baseDate, className: 'Anatomy 101' },
      {
        studentId: student._id,
        studentRef: { studentId: student.studentId, studentName: `${student.firstName} ${student.lastName}`, courseGroup: student.programName, academicYear: student.academicYear },
        className: 'Anatomy 101',
        room: 'A-101',
        cameraId: 'CAM-ENTR-01',
        date: baseDate,
        classStartTime: classStart,
        classEndTime: classEnd,
        timeIn: new Date('2025-09-26T08:10:00.000Z'),
        timeOut: new Date('2025-09-26T10:00:00.000Z'),
        status: 'Present',
        entryLogs: [ { type: 'in', timestamp: new Date('2025-09-26T08:10:00.000Z'), cameraId: 'CAM-ENTR-01', location: 'Gate 1', aiConfidence: 0.98 }, { type: 'out', timestamp: new Date('2025-09-26T10:00:00.000Z'), cameraId: 'CAM-EXIT-02', location: 'Gate 2', aiConfidence: 0.97 } ]
      },
      { upsert: true }
    );

    const baseDate2 = new Date('2025-09-25');
    const classStart2 = new Date('2025-09-25T08:00:00.000Z');
    const classEnd2 = new Date('2025-09-25T10:00:00.000Z');
    await Attendance.updateOne(
      { studentId: student._id, date: baseDate2, className: 'Biochemistry 101' },
      {
        studentId: student._id,
        studentRef: { studentId: student.studentId, studentName: `${student.firstName} ${student.lastName}`, courseGroup: student.programName, academicYear: student.academicYear },
        className: 'Biochemistry 101',
        room: 'B-202',
        cameraId: 'CAM-ENTR-03',
        date: baseDate2,
        classStartTime: classStart2,
        classEndTime: classEnd2,
        timeIn: new Date('2025-09-25T08:15:00.000Z'),
        timeOut: new Date('2025-09-25T10:05:00.000Z'),
        status: 'Late',
        entryLogs: [ { type: 'in', timestamp: new Date('2025-09-25T08:15:00.000Z'), cameraId: 'CAM-ENTR-03', location: 'Gate 1', aiConfidence: 0.95 } ]
      },
      { upsert: true }
    );

    console.log('Seed complete:', { studentId: student._id.toString(), feeId: fee._id.toString() });
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
