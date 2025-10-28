require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Student = require('../models/Student');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const Timetable = require('../models/Timetable');
const Employee = require('../models/Employee');
const PenaltyConfig = require('../models/PenaltyConfig');
const FeeHead = require('../models/FeeHead');

function rng(i){ return Math.abs(Math.sin(i * 9301 + 49297) * 233280) % 1; }

async function upsertStudent(i){
  const idx = (i+1).toString().padStart(3,'0');
  const email = `student${idx}@example.com`;
  const exists = await Student.findOne({ email });
  if (exists) return exists;
  const password = await bcrypt.hash('Password123', 10);
  const firstNames = ['Jane','John','Asha','Rahul','Priya','Arun','Meera','Kiran','Lakshmi','Vikram'];
  const lastNames = ['Smith','Kumar','Reddy','Iyer','Sharma','Nair','Das','Gupta','Singh','Verma'];
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[(i*3) % lastNames.length];
  const s = new Student({
    studentId: `STU${idx}`,
    enrollmentNumber: `EN2025${idx}`,
    firstName: fn,
    lastName: ln,
    dob: new Date(`2004-01-${String((i%28)+1).padStart(2,'0')}`),
    gender: i%2===0?'Female':'Male',
    email,
    contactNumber: `98${(10000000 + i*137).toString().padStart(8,'0')}`.slice(0,10),
    permanentAddress: `${(i%200)+1} MG Road, City ${(i%10)+1}`,
    programName: ['MBBS','BDS','BPT'][i%3],
    admissionDate: new Date('2025-08-01'),
    academicYear: '2025-2026',
    guardianName: `Guardian ${fn}`,
    guardianContact: `99${(20000000 + i*143).toString().padStart(8,'0')}`.slice(0,10),
    studentType: 'full-time',
    password
  });
  await s.save();
  return s;
}

async function ensureFeeForStudent(student){
  const key = { studentId: student._id, academicYear: '2025-2026', semester: '1' };
  let fee = await Fee.findOne(key);
  if (!fee) {
    const tuition = 90000 + Math.floor(rng(student._id.toString().length) * 20000);
    const semesterFee = 20000 + Math.floor(rng(student._id.toString().charCodeAt(0)) * 10000);
    const hostelFee = (student.programName==='MBBS' && (student.studentId.endsWith('1')||student.studentId.endsWith('2')))? 30000 : 0;
    const feeBreakdown = { tuitionFee: tuition, semesterFee, hostelFee, libraryFee: 0, labFee: 0, otherFees: 0 };
    fee = new Fee({ ...key, feeBreakdown, totalAmount: 0, dueAmount: 0, dueDate: new Date('2025-10-31') });
    await fee.save();
  }
  return fee;
}

async function upsertAttendance(student, timetable){
  // One record per student for the first timetable entry
  const date = new Date('2025-09-26');
  const key = { studentId: student._id, date, className: timetable.className };
  const status = ['Present','Late','Present','Absent'][student.studentId.charCodeAt(student.studentId.length-1)%4];
  const doc = {
    studentId: student._id,
    studentRef: { studentId: student.studentId, studentName: `${student.firstName} ${student.lastName}`, courseGroup: student.programName, academicYear: student.academicYear },
    className: timetable.className,
    room: timetable.room,
    cameraId: 'CAM-ENTR-01',
    date,
    classStartTime: new Date(`2025-09-26T${timetable.startTime}:00.000Z`),
    classEndTime: new Date(`2025-09-26T${timetable.endTime}:00.000Z`),
    timeIn: status==='Absent'? null : new Date('2025-09-26T08:10:00.000Z'),
    timeOut: status==='Absent'? null : new Date('2025-09-26T10:00:00.000Z'),
    status,
  };
  await Attendance.updateOne(key, doc, { upsert: true });
}

async function ensureTimetable(){
  const definitions = [
    { className: 'Anatomy 101', room: 'A-101', programName: 'MBBS', academicYear: '2025-2026', dayOfWeek: 1, startTime: '08:00', endTime: '10:00', capacity: 60 },
    { className: 'Biochemistry 101', room: 'B-202', programName: 'MBBS', academicYear: '2025-2026', dayOfWeek: 2, startTime: '10:00', endTime: '12:00', capacity: 60 },
    { className: 'Physiology 101', room: 'C-303', programName: 'MBBS', academicYear: '2025-2026', dayOfWeek: 3, startTime: '12:00', endTime: '14:00', capacity: 60 },
    { className: 'Dental Anatomy', room: 'D-101', programName: 'BDS', academicYear: '2025-2026', dayOfWeek: 1, startTime: '09:00', endTime: '11:00', capacity: 40 },
    { className: 'Physiotherapy Basics', room: 'P-201', programName: 'BPT', academicYear: '2025-2026', dayOfWeek: 4, startTime: '11:00', endTime: '13:00', capacity: 50 },
  ];
  const created = [];
  for (const d of definitions) {
    const existing = await Timetable.findOne({ className: d.className, room: d.room, dayOfWeek: d.dayOfWeek });
    if (existing) { created.push(existing); continue; }
    const t = new Timetable(d);
    await t.save();
    created.push(t);
  }
  return created;
}

async function upsertEmployees(n=20){
  const docs = [];
  for (let i=0;i<n;i++){
    const idx = (i+1).toString().padStart(4,'0');
    docs.push({
      updateOne: {
        filter: { employeeId: `EMP${idx}` },
        update: {
          $setOnInsert: {
            name: `Employee ${idx}`,
            employeeId: `EMP${idx}`,
            mobile: `9${(700000000 + i*1111).toString().slice(0,9)}`,
            email: `emp${idx}@example.com`,
            role: ['staff','admin','faculty'][i%3],
            status: 'active'
          }
        },
        upsert: true
      }
    });
  }
  if (docs.length) await Employee.bulkWrite(docs, { ordered: false });
}

async function ensurePenaltyConfig(){
  const exists = await PenaltyConfig.findOne({ academicYear: '2025-2026' });
  if (!exists) await PenaltyConfig.create({ academicYear: '2025-2026', penaltyType: 'Fixed', penaltyAmount: 500, gracePeriodDays: 3, isActive: true });
}

async function ensureFeeHeads(){
  const heads = ['Tuition Fee','Semester Fee','Library Fee','Lab Fee','Hostel Fee','Transport Fee'];
  for (const name of heads){
    const exists = await FeeHead.findOne({ name });
    if (!exists) await FeeHead.create({ name, description: `${name} for 2025-26`, isActive: true });
  }
}

(async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
  await mongoose.connect(uri);
  try {
    const timetables = await ensureTimetable();
    await ensurePenaltyConfig();
    await ensureFeeHeads();

    // Create 20 students with fees and attendance
    const t0 = timetables[0] || (await ensureTimetable())[0];
    for (let i=0;i<20;i++){
      const s = await upsertStudent(i);
      await ensureFeeForStudent(s);
      if (t0) await upsertAttendance(s, t0);
    }

    // Create 20 employees
    await upsertEmployees(20);

    console.log('Bulk seed complete.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Bulk seed failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
})();
