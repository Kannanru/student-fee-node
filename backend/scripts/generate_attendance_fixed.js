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

        // Randomize attendance (80% present, 20% absent)
        const isPresent = Math.random() < 0.8;
        let timeIn = null;
        
        if (isPresent) {
          // For present students, randomize arrival time (-10 to +20 minutes)
          const arrivalVariation = Math.floor(Math.random() * 30) - 10;
          timeIn = new Date(sessionDate.getTime() + (arrivalVariation * 60 * 1000));
        }

        // Calculate class end time
        const [endHours, endMinutes] = session.endTime.split(':');
        const classEndTime = new Date(sessionDate);
        classEndTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

        // Calculate timeOut (if present, stays for most of class)
        let timeOut = null;
        if (timeIn) {
          const stayDuration = 2.5 + (Math.random() * 0.5); // 2.5-3 hours
          timeOut = new Date(timeIn.getTime() + (stayDuration * 60 * 60 * 1000));
          // Don't go beyond class end time
          if (timeOut > classEndTime) {
            timeOut = classEndTime;
          }
        }

        // Create attendance record (let model calculate status and lateMinutes)
        const attendanceRecord = {
          studentId: student._id,
          studentRef: {
            studentId: student.studentId || `STU${student._id.toString().slice(-6)}`,
            studentName: `${student.firstName} ${student.lastName}`,
            courseGroup: student.programName || 'BDS',
            academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
          },
          className: session.name === 'Morning Session' ? 'General Medicine' : 'Clinical Practice',
          date: sessionDate,
          classStartTime: sessionDate,
          classEndTime: classEndTime,
          timeIn: timeIn,
          timeOut: timeOut,
          source: 'Auto',
          room: `Room ${Math.floor(Math.random() * 20) + 1}`,
          cameraId: `CAM_${Math.floor(Math.random() * 10) + 1}`,
          aiConfidence: timeIn ? 0.85 + (Math.random() * 0.15) : null
        };

        attendanceRecords.push(attendanceRecord);
        recordCount++;
      }
    }

    // Bulk insert attendance records
    console.log(`\n📊 Inserting ${attendanceRecords.length} attendance records...`);
    const insertedRecords = await Attendance.insertMany(attendanceRecords);

    console.log(`\n✅ Successfully generated ${insertedRecords.length} attendance records`);
    console.log(`📊 Summary:`);
    console.log(`   📅 Date: October 24, 2025`);
    console.log(`   👥 Students: ${students.length}`);
    console.log(`   📚 Sessions per student: ${sessions.length}`);
    console.log(`   📝 Total records: ${insertedRecords.length}`);

    // Generate summary statistics from inserted records (which have calculated status)
    const statusCounts = {};
    for (const record of insertedRecords) {
      statusCounts[record.status] = (statusCounts[record.status] || 0) + 1;
    }

    console.log(`\n📈 Attendance Statistics:`);
    for (const [status, count] of Object.entries(statusCounts)) {
      const percentage = ((count / insertedRecords.length) * 100).toFixed(2);
      console.log(`   ${status}: ${count} (${percentage}%)`);
    }

    // Show department-wise breakdown
    const departmentStats = {};
    for (const record of insertedRecords) {
      const dept = record.studentRef.courseGroup;
      if (!departmentStats[dept]) {
        departmentStats[dept] = { present: 0, late: 0, absent: 0, total: 0 };
      }
      if (record.status === 'Present') departmentStats[dept].present++;
      else if (record.status === 'Late') departmentStats[dept].late++;
      else if (record.status === 'Absent') departmentStats[dept].absent++;
      departmentStats[dept].total++;
    }

    console.log(`\n🏛️ Department-wise Attendance:`);
    for (const [dept, stats] of Object.entries(departmentStats)) {
      const deptRate = (((stats.present + stats.late) / stats.total) * 100).toFixed(2);
      console.log(`   ${dept}: Present(${stats.present}) Late(${stats.late}) Absent(${stats.absent}) - Rate: ${deptRate}%`);
    }

    console.log(`\n🎉 Sample attendance data generation completed!`);
    console.log(`\n📋 You can now view reports at:`);
    console.log(`   🌐 http://localhost:4200/reports/attendance`);
    console.log(`   📊 Select date: October 24, 2025`);

  } catch (error) {
    console.error('❌ Error generating attendance data:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
generateSampleAttendance();