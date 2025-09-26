const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Timetable = require('../models/Timetable');
const { notifyAttendanceAlert } = require('../utils/notifier');

// Upsert/record attendance (from AI or admin)
// Simple in-memory SSE clients registry
const sseClients = new Set();
exports.sseStream = async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.write('\n');
  sseClients.add(res);
  req.on('close', () => {
    sseClients.delete(res);
  });
};

function broadcastSse(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try { client.write(payload); } catch {}
  }
}

exports.record = async (req, res, next) => {
  try {
    const { studentId, className, room, cameraId, date, classStartTime, classEndTime, timeIn, timeOut, status, reasonForAbsence, aiConfidence, entryLogs, courseGroup, academicYear } = req.body;
    if (!studentId || !className || !date || !classStartTime || !classEndTime || !status) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Try to locate a matching timetable entry (same program/year, same className, same dayOfWeek, and overlapping time)
    let timetableId;
    try {
      const dayOfWeek = new Date(date).getUTCDay();
      const tt = await Timetable.find({
        programName: courseGroup || student.programName,
        academicYear: academicYear || student.academicYear,
        className,
        dayOfWeek
      });
      // naive time overlap check HH:MM strings
      const [startH, startM] = String(new Date(classStartTime).toISOString().substring(11,16)).split(':').map(Number);
      const [endH, endM] = String(new Date(classEndTime).toISOString().substring(11,16)).split(':').map(Number);
      const reqStart = startH*60 + startM;
      const reqEnd = endH*60 + endM;
      for (const t of tt) {
        const tStart = parseInt(t.startTime.split(':')[0]) * 60 + parseInt(t.startTime.split(':')[1]);
        const tEnd = parseInt(t.endTime.split(':')[0]) * 60 + parseInt(t.endTime.split(':')[1]);
        const overlaps = !(reqEnd <= tStart || reqStart >= tEnd);
        if (overlaps) { timetableId = t._id; break; }
      }
    } catch {}

    if (!timetableId && String(process.env.ATTENDANCE_REQUIRE_TIMETABLE).toLowerCase() === 'true') {
      return res.status(400).json({ success: false, message: 'No matching timetable found for this record', code: 'TIMETABLE_MISMATCH' });
    }

    const doc = {
      studentId,
      studentRef: {
        studentId: student.studentId,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        courseGroup: courseGroup || student.programName,
        academicYear: academicYear || student.academicYear
      },
      className,
      timetableId,
      room,
      cameraId,
      date: new Date(date),
      classStartTime: new Date(classStartTime),
      classEndTime: new Date(classEndTime),
      timeIn: timeIn ? new Date(timeIn) : undefined,
      timeOut: timeOut ? new Date(timeOut) : undefined,
      status,
      reasonForAbsence,
      aiConfidence,
      entryLogs: Array.isArray(entryLogs) ? entryLogs : []
    };

    const options = { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true };
    const record = await Attendance.findOneAndUpdate({ studentId, date: new Date(date), className }, doc, options);

    // Emit notifications for Late/Absent
    if (record.status === 'Late' || record.status === 'Absent') {
      const payload = {
        type: record.status,
        className: record.className,
        student: doc.studentRef,
        date: doc.date,
        lateMinutes: record.lateMinutes || 0
      };
      broadcastSse('attendance-alert', payload);
      notifyAttendanceAlert(payload);
    }

    res.status(201).json({ success: true, message: 'Attendance recorded', data: record, warnings: timetableId ? undefined : ['No matching timetable found for this record'] });
  } catch (err) { next(err); }
};

// PDF export for a given date (daily report)
exports.adminExportPdf = async (req, res, next) => {
  try {
    const PDFDocument = require('pdfkit');
    const { date } = req.query;
    const d = date ? new Date(date) : new Date();
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59));
    const items = await Attendance.find({ date: { $gte: start, $lte: end } }).sort({ className: 1, 'studentRef.studentName': 1 });
    // Preload timetable capacities for this dayOfWeek
    const dayOfWeek = d.getUTCDay();
    let capMap = new Map();
    try {
      const tts = await Timetable.find({ dayOfWeek });
      for (const t of tts) {
        const key = `${t.className}|${t.room||''}`;
        if (!capMap.has(key)) capMap.set(key, typeof t.capacity === 'number' ? t.capacity : undefined);
        else if (typeof t.capacity === 'number') capMap.set(key, Math.max(capMap.get(key) || 0, t.capacity));
      }
    } catch {}

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_${start.toISOString().slice(0,10)}.pdf"`);
    const doc = new PDFDocument({ margin: 36, size: 'A4' });
    doc.pipe(res);
    doc.fontSize(16).text('Daily Attendance Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Date: ${start.toISOString().slice(0,10)}`);
    doc.moveDown(1);
    const header = ['Student Name','Student ID','Class','Room','Time In','Time Out','Status','Late (min)','TimetableId','Capacity'];
    header.forEach((h, i) => doc.text(h, { continued: i < header.length-1 }));
    doc.moveDown(0.5);
    items.forEach(a => {
      const row = [
        (a.studentRef && a.studentRef.studentName) || '',
        (a.studentRef && a.studentRef.studentId) || '',
        a.className || '',
        a.room || '',
        a.timeIn ? new Date(a.timeIn).toISOString().substring(11,16) : '',
        a.timeOut ? new Date(a.timeOut).toISOString().substring(11,16) : '',
        a.status || '',
        a.lateMinutes != null ? String(a.lateMinutes) : '',
        a.timetableId ? String(a.timetableId) : '',
        (capMap.get(`${a.className}|${a.room||''}`) ?? '')
      ];
      row.forEach((cell, i) => doc.text(cell, { continued: i < row.length-1 }));
      doc.moveDown(0.2);
    });
    // Occupancy summary section
    try {
      const pipeline = [
        { $match: { date: { $gte: start, $lte: end } } },
        { $group: { _id: { className: '$className', room: '$room' },
                    present: { $sum: { $cond: [ { $eq: [ '$status', 'Present' ] }, 1, 0 ] } },
                    late: { $sum: { $cond: [ { $eq: [ '$status', 'Late' ] }, 1, 0 ] } },
                    absent: { $sum: { $cond: [ { $eq: [ '$status', 'Absent' ] }, 1, 0 ] } },
                    earlyLeave: { $sum: { $cond: [ { $eq: [ '$status', 'Early Leave' ] }, 1, 0 ] } },
                    total: { $sum: 1 } } },
        { $project: { _id: 0, className: '$_id.className', room: '$_id.room', present: 1, late: 1, absent: 1, earlyLeave: 1, total: 1 } },
        { $sort: { className: 1, room: 1 } }
      ];
      const occ = await Attendance.aggregate(pipeline);
      doc.addPage();
      doc.fontSize(14).text('Occupancy Summary', { align: 'center' });
      doc.moveDown(0.5);
      const h2 = ['Class','Room','Capacity','Present','Late','Absent','Early Leave','Total'];
      h2.forEach((h, i) => doc.text(h, { continued: i < h2.length-1 }));
      doc.moveDown(0.5);
      for (const r of occ) {
        const cap = capMap.get(`${r.className}|${r.room||''}`) ?? '';
        const rr = [ r.className||'', r.room||'', cap, String(r.present||0), String(r.late||0), String(r.absent||0), String(r.earlyLeave||0), String(r.total||0) ];
        rr.forEach((cell, i) => doc.text(cell, { continued: i < rr.length-1 }));
        doc.moveDown(0.2);
      }
    } catch {}
    doc.end();
  } catch (err) { next(err); }
};

// Student views
exports.getStudentDaily = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { date } = req.query;
    const d = date ? new Date(date) : new Date();
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59));
    const items = await Attendance.find({ studentId, date: { $gte: start, $lte: end } }).sort({ classStartTime: 1 });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

exports.getStudentSummary = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
    const end = endDate ? new Date(endDate) : new Date();
    const items = await Attendance.find({ studentId, date: { $gte: start, $lte: end } });
    const tally = { Present: 0, Late: 0, Absent: 0, 'Early Leave': 0 };
    items.forEach(i => { tally[i.status] = (tally[i.status] || 0) + 1; });
    const total = items.length || 1;
    const percentage = Math.round(((tally['Present'] + tally['Late']) / total) * 100);
    res.json({ success: true, data: { tally, percentage, totalClasses: items.length } });
  } catch (err) { next(err); }
};

// Admin reports
exports.adminDailyReport = async (req, res, next) => {
  try {
    const { date } = req.query;
    const d = date ? new Date(date) : new Date();
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59));
    const items = await Attendance.find({ date: { $gte: start, $lte: end } }).sort({ 'studentRef.studentName': 1 });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

exports.adminSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
    const end = endDate ? new Date(endDate) : new Date();
    const pipeline = [
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ];
    const grouped = await Attendance.aggregate(pipeline);
    const summary = { Present: 0, Late: 0, Absent: 0, 'Early Leave': 0 };
    grouped.forEach(g => summary[g._id] = g.count);
    const total = Object.values(summary).reduce((a,b)=>a+b,0) || 1;
    const percentage = Math.round(((summary['Present'] + summary['Late']) / total) * 100);
    res.json({ success: true, data: { summary, percentage, total } });
  } catch (err) { next(err); }
};

exports.listLogs = async (req, res, next) => {
  try {
    const { studentId, date } = req.query;
    const q = {};
    if (studentId) q.studentId = studentId;
    if (date) {
      const d = new Date(date);
      const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
      const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59));
      q.date = { $gte: start, $lte: end };
    }
    const items = await Attendance.find(q).select('studentRef className date entryLogs');
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

// Admin occupancy by class/room for a given date
exports.adminOccupancy = async (req, res, next) => {
  try {
    const { date } = req.query;
    const d = date ? new Date(date) : new Date();
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59));
    const pipeline = [
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: { className: '$className', room: '$room' },
                  present: { $sum: { $cond: [ { $eq: [ '$status', 'Present' ] }, 1, 0 ] } },
                  late: { $sum: { $cond: [ { $eq: [ '$status', 'Late' ] }, 1, 0 ] } },
                  absent: { $sum: { $cond: [ { $eq: [ '$status', 'Absent' ] }, 1, 0 ] } },
                  earlyLeave: { $sum: { $cond: [ { $eq: [ '$status', 'Early Leave' ] }, 1, 0 ] } },
                  total: { $sum: 1 } } },
      { $project: { _id: 0, className: '$_id.className', room: '$_id.room', present: 1, late: 1, absent: 1, earlyLeave: 1, total: 1 } },
      { $sort: { className: 1, room: 1 } }
    ];
    const data = await Attendance.aggregate(pipeline);
    // Attach capacity from timetable (best-effort by className+room and dayOfWeek)
    const dayOfWeek = d.getUTCDay();
    const withCap = [];
    for (const row of data) {
      let capacity;
      try {
        const t = await Timetable.find({ className: row.className, room: row.room, dayOfWeek }).sort({ capacity: -1 }).limit(1);
        if (t && t[0] && typeof t[0].capacity === 'number') capacity = t[0].capacity;
      } catch {}
      withCap.push({ ...row, capacity });
    }
    res.json({ success: true, data: withCap });
  } catch (err) { next(err); }
};

// Admin CSV export for a date range
exports.adminExportCsv = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
    const end = endDate ? new Date(endDate) : new Date();
    const items = await Attendance.find({ date: { $gte: start, $lte: end } }).sort({ date: 1, className: 1 });
    const header = ['Student Name','Student ID','Date','Class Name','Room','Time In','Time Out','Status','Late Minutes','Reason','CameraId','AI Confidence','TimetableId','Capacity'];
    const rows = [header.join(',')];
    for (const a of items) {
      const row = [
        (a.studentRef && a.studentRef.studentName) || '',
        (a.studentRef && a.studentRef.studentId) || '',
        a.date ? new Date(a.date).toISOString().slice(0,10) : '',
        a.className || '',
        a.room || '',
        a.timeIn ? new Date(a.timeIn).toISOString() : '',
        a.timeOut ? new Date(a.timeOut).toISOString() : '',
        a.status || '',
        a.lateMinutes != null ? String(a.lateMinutes) : '',
        a.reasonForAbsence || '',
        a.cameraId || '',
        a.aiConfidence != null ? String(a.aiConfidence) : '',
        a.timetableId ? String(a.timetableId) : '',
        ''
      ].map(v => {
        const s = String(v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      });
      rows.push(row.join(','));
    }
    // Occupancy summary per class/room with capacity
    try {
      const dayOfWeek = (start instanceof Date ? start : new Date(start)).getUTCDay();
      const occPipeline = [
        { $match: { date: { $gte: start, $lte: end } } },
        { $group: { _id: { className: '$className', room: '$room' },
                    present: { $sum: { $cond: [ { $eq: [ '$status', 'Present' ] }, 1, 0 ] } },
                    late: { $sum: { $cond: [ { $eq: [ '$status', 'Late' ] }, 1, 0 ] } },
                    absent: { $sum: { $cond: [ { $eq: [ '$status', 'Absent' ] }, 1, 0 ] } },
                    earlyLeave: { $sum: { $cond: [ { $eq: [ '$status', 'Early Leave' ] }, 1, 0 ] } },
                    total: { $sum: 1 } } },
        { $project: { _id: 0, className: '$_id.className', room: '$_id.room', present: 1, late: 1, absent: 1, earlyLeave: 1, total: 1 } },
        { $sort: { className: 1, room: 1 } }
      ];
      const occ = await Attendance.aggregate(occPipeline);
      for (const r of occ) {
        let capacity = '';
        try {
          const t = await Timetable.find({ className: r.className, room: r.room, dayOfWeek }).sort({ capacity: -1 }).limit(1);
          if (t && t[0] && typeof t[0].capacity === 'number') capacity = String(t[0].capacity);
        } catch {}
        const occRow = ['OCCUPANCY', '', '', r.className || '', r.room || '', '', '', '', '', '', '', '', '', capacity,
                        '', '', '', '', String(r.present||0), String(r.late||0), String(r.absent||0), String(r.earlyLeave||0), String(r.total||0)];
        rows.push(occRow.join(','));
      }
    } catch {}
    const csv = rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance_export.csv"');
    res.send(csv);
  } catch (err) { next(err); }
};

exports.requestCorrection = async (req, res, next) => {
  try {
    const { studentId, date, className, reason } = req.body;
    if (!studentId || !date || !className || !reason) return res.status(400).json({ success: false, message: 'studentId, date, className, reason are required' });
    const record = await Attendance.findOne({ studentId, date: new Date(date), className });
    if (!record) return res.status(404).json({ success: false, message: 'Attendance record not found' });
    record.correctionRequests.push({ reason });
    await record.save();
    res.status(201).json({ success: true, message: 'Correction request submitted', data: record.correctionRequests[record.correctionRequests.length - 1] });
  } catch (err) { next(err); }
};

exports.reviewCorrection = async (req, res, next) => {
  try {
    const { id } = req.params; // attendance id
    const { index, status, adminNotes } = req.body; // index of correction request in array
    const record = await Attendance.findById(id);
    if (!record) return res.status(404).json({ success: false, message: 'Attendance record not found' });
    if (index == null || !record.correctionRequests[index]) return res.status(400).json({ success: false, message: 'Invalid correction request index' });
    record.correctionRequests[index].status = status || record.correctionRequests[index].status;
    record.correctionRequests[index].adminNotes = adminNotes;
    await record.save();
    res.json({ success: true, message: 'Correction reviewed', data: record.correctionRequests[index] });
  } catch (err) { next(err); }
};
