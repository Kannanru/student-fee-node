// Generate sample attendance data for October 24, 2025
require('dotenv').config();
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';

async function generateSampleAttendance() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Target date: October 24, 2025
    const targetDate = new Date('2025-10-24T09:00:00.000Z');
    console.log(`\n🎯 Generating attendance data for: ${targetDate.toDateString()}`);

    // Get all students
    const students = await Student.find({ status: 'active' }).select('_id firstName lastName studentId programName semester section');
    console.log(`📚 Found ${students.length} active students`);

    if (students.length === 0) {
      console.log('❌ No students found. Please ensure students exist in the database.');
      process.exit(1);
    }

    // Delete existing attendance for this date to avoid duplicates
    await Attendance.deleteMany({
      date: {
        $gte: new Date('2025-10-24T00:00:00.000Z'),
        $lt: new Date('2025-10-25T00:00:00.000Z')
      }
    });
    console.log('🗑️ Cleared existing attendance for October 24, 2025');

    const attendanceRecords = [];
    const departments = ['BDS', 'MDS'];
    const sessions = [
      { name: 'Morning Session', startTime: '09:00', endTime: '12:00' },
      { name: 'Afternoon Session', startTime: '14:00', endTime: '17:00' }
    ];

    let recordCount = 0;

    for (const student of students) {
      for (const session of sessions) {
        // Create session date with time
        const sessionDate = new Date(targetDate);
        const [hours, minutes] = session.startTime.split(':');
        sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Randomize attendance status (90% present, 10% absent)
        const isPresent = Math.random() > 0.1;
        const status = isPresent ? 'present' : 'absent';

        // Create attendance record
        const attendanceRecord = {
          studentId: student._id,
          date: sessionDate,
          session: session.name,
          status: status,
          timeIn: isPresent ? sessionDate : null,
          timeOut: isPresent ? new Date(sessionDate.getTime() + (3 * 60 * 60 * 1000)) : null, // 3 hours later
          location: 'Main Campus',
          semester: student.semester || 1,
          section: student.section || 'A',
          department: student.programName || 'BDS',
          subject: session.name === 'Morning Session' ? 'General Medicine' : 'Clinical Practice',
          faculty: session.name === 'Morning Session' ? 'Dr. Smith' : 'Dr. Johnson',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        attendanceRecords.push(attendanceRecord);
        recordCount++;
      }
    }

    // Bulk insert attendance records
    console.log(`\n📊 Inserting ${attendanceRecords.length} attendance records...`);
    await Attendance.insertMany(attendanceRecords);

    console.log(`\n✅ Successfully generated ${attendanceRecords.length} attendance records`);
    console.log(`📊 Summary:`);
    console.log(`   📅 Date: October 24, 2025`);
    console.log(`   👥 Students: ${students.length}`);
    console.log(`   📚 Sessions per student: ${sessions.length}`);
    console.log(`   📝 Total records: ${attendanceRecords.length}`);

    // Generate summary statistics
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
    const attendanceRate = ((presentCount / attendanceRecords.length) * 100).toFixed(2);

    console.log(`\n📈 Attendance Statistics:`);
    console.log(`   ✅ Present: ${presentCount} (${attendanceRate}%)`);
    console.log(`   ❌ Absent: ${absentCount} (${(100 - attendanceRate).toFixed(2)}%)`);

    // Show department-wise breakdown
    const departmentStats = {};
    for (const record of attendanceRecords) {
      if (!departmentStats[record.department]) {
        departmentStats[record.department] = { present: 0, absent: 0, total: 0 };
      }
      departmentStats[record.department][record.status]++;
      departmentStats[record.department].total++;
    }

    console.log(`\n🏛️ Department-wise Attendance:`);
    for (const [dept, stats] of Object.entries(departmentStats)) {
      const deptRate = ((stats.present / stats.total) * 100).toFixed(2);
      console.log(`   ${dept}: ${stats.present}/${stats.total} (${deptRate}%)`);
    }

    console.log(`\n🎉 Sample attendance data generation completed!`);
    console.log(`\n📋 You can now view reports at:`);
    console.log(`   🌐 http://localhost:4200/attendance`);
    console.log(`   📊 Select date: October 24, 2025`);

  } catch (error) {
    console.error('❌ Error generating attendance data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
generateSampleAttendance();