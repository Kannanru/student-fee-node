// Create sample attendance data for reports testing
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';

async function createSampleAttendanceData() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get all students
    const students = await Student.find({ status: 'active' }).limit(20);
    console.log(`📊 Found ${students.length} students`);

    if (students.length === 0) {
      console.log('❌ No students found. Please add students first.');
      process.exit(1);
    }

    // Check if attendance data already exists
    const existingAttendance = await Attendance.countDocuments();
    console.log(`📊 Found ${existingAttendance} existing attendance records`);

    if (existingAttendance > 50) {
      console.log('✅ Sufficient attendance data already exists');
      process.exit(0);
    }

    console.log('\n🔄 Creating sample attendance data...\n');

    const classes = ['BDS-1st Year', 'BDS-2nd Year', 'BDS-3rd Year', 'BDS-4th Year'];
    const statuses = ['Present', 'Late', 'Absent', 'Early Leave'];
    const statusWeights = [0.75, 0.15, 0.08, 0.02]; // Weighted distribution

    let createdCount = 0;
    let errorCount = 0;

    // Create attendance for last 30 days
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      date.setHours(9, 0, 0, 0); // 9 AM start time

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const student of students) {
        try {
          // Random class selection
          const className = classes[Math.floor(Math.random() * classes.length)];
          
          // Weighted random status selection
          const rand = Math.random();
          let cumulativeWeight = 0;
          let selectedStatus = statuses[0];
          
          for (let i = 0; i < statuses.length; i++) {
            cumulativeWeight += statusWeights[i];
            if (rand <= cumulativeWeight) {
              selectedStatus = statuses[i];
              break;
            }
          }

          // Create class times
          const classStartTime = new Date(date);
          const classEndTime = new Date(date);
          classEndTime.setHours(classStartTime.getHours() + 1); // 1 hour class

          // Set attendance times based on status
          let timeIn = null;
          let timeOut = null;
          let lateMinutes = 0;
          let duration = 60; // default 60 minutes

          if (selectedStatus === 'Present') {
            timeIn = new Date(classStartTime);
            timeIn.setMinutes(timeIn.getMinutes() - Math.floor(Math.random() * 10)); // Early by 0-10 mins
            timeOut = new Date(classEndTime);
            timeOut.setMinutes(timeOut.getMinutes() + Math.floor(Math.random() * 5)); // Stay 0-5 mins extra
            duration = Math.floor((timeOut - timeIn) / (1000 * 60));
          } else if (selectedStatus === 'Late') {
            lateMinutes = 5 + Math.floor(Math.random() * 25); // 5-30 minutes late
            timeIn = new Date(classStartTime);
            timeIn.setMinutes(timeIn.getMinutes() + lateMinutes);
            timeOut = new Date(classEndTime);
            duration = Math.floor((timeOut - timeIn) / (1000 * 60));
          } else if (selectedStatus === 'Early Leave') {
            timeIn = new Date(classStartTime);
            timeOut = new Date(classEndTime);
            timeOut.setMinutes(timeOut.getMinutes() - (10 + Math.floor(Math.random() * 20))); // Leave 10-30 mins early
            duration = Math.floor((timeOut - timeIn) / (1000 * 60));
          }
          // For 'Absent', timeIn and timeOut remain null

          const attendanceRecord = new Attendance({
            studentId: student._id,
            studentRef: {
              studentId: student.studentId,
              studentName: `${student.firstName} ${student.lastName}`,
              courseGroup: className,
              academicYear: student.academicYear || '2024-2025'
            },
            className: className,
            date: date,
            classStartTime: classStartTime,
            classEndTime: classEndTime,
            timeIn: timeIn,
            timeOut: timeOut,
            duration: duration,
            status: selectedStatus,
            lateMinutes: lateMinutes,
            source: 'Auto',
            aiConfidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
            room: `Room ${Math.floor(Math.random() * 20) + 1}`,
            entryLogs: timeIn ? [{
              type: 'in',
              timestamp: timeIn,
              cameraId: `CAM_${Math.floor(Math.random() * 10) + 1}`,
              location: 'Main Building',
              aiConfidence: Math.random() * 0.3 + 0.7
            }] : []
          });

          // Add exit log if timeOut exists
          if (timeOut) {
            attendanceRecord.entryLogs.push({
              type: 'out',
              timestamp: timeOut,
              cameraId: `CAM_${Math.floor(Math.random() * 10) + 1}`,
              location: 'Main Building',
              aiConfidence: Math.random() * 0.3 + 0.7
            });
          }

          await attendanceRecord.save();
          createdCount++;

          if (createdCount % 50 === 0) {
            console.log(`✅ Created ${createdCount} attendance records...`);
          }

        } catch (error) {
          errorCount++;
          if (errorCount < 5) { // Only log first few errors
            console.error(`❌ Error creating attendance for ${student.studentId}:`, error.message);
          }
        }
      }
    }

    console.log(`\n📊 Sample Attendance Data Creation Summary:`);
    console.log(`   ✅ Successfully created: ${createdCount} records`);
    console.log(`   ❌ Errors: ${errorCount} records`);
    console.log(`   📅 Date range: Last 30 days (excluding weekends)`);
    console.log(`   👥 Students: ${students.length}`);
    console.log(`   📚 Classes: ${classes.join(', ')}`);
    console.log('\n✅ Sample attendance data creation completed!\n');

    // Create summary stats
    const totalRecords = await Attendance.countDocuments();
    const presentRecords = await Attendance.countDocuments({ status: 'Present' });
    const absentRecords = await Attendance.countDocuments({ status: 'Absent' });
    const lateRecords = await Attendance.countDocuments({ status: 'Late' });

    console.log(`📈 Database Statistics:`);
    console.log(`   Total Attendance Records: ${totalRecords}`);
    console.log(`   Present: ${presentRecords} (${((presentRecords/totalRecords)*100).toFixed(1)}%)`);
    console.log(`   Absent: ${absentRecords} (${((absentRecords/totalRecords)*100).toFixed(1)}%)`);
    console.log(`   Late: ${lateRecords} (${((lateRecords/totalRecords)*100).toFixed(1)}%)`);

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
createSampleAttendanceData();
