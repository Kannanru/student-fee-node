// Check and fix attendance-session linkage for October 24, 2025
require('dotenv').config();
const mongoose = require('mongoose');
const ClassSession = require('../models/ClassSession');
const Attendance = require('../models/Attendance');
const Timetable = require('../models/Timetable');
const Hall = require('../models/Hall');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';

async function fixAttendanceSessionLinkage() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const targetDate = new Date('2025-10-24T09:00:00.000Z');
    console.log(`\n🎯 Checking sessions and attendance for: ${targetDate.toDateString()}`);

    // Check existing sessions for October 24, 2025
    const existingSessions = await ClassSession.find({
      date: {
        $gte: new Date('2025-10-24T00:00:00.000Z'),
        $lt: new Date('2025-10-25T00:00:00.000Z')
      }
    }).populate('timetableId').populate('hallId');

    console.log(`📚 Found ${existingSessions.length} existing sessions`);

    if (existingSessions.length === 0) {
      console.log('\n🏗️ No sessions found. Creating sessions from timetable...');
      
      // Get day of week (October 24, 2025 is a Friday = 5)
      const dayOfWeek = 5; // Friday
      
      const timetableEntries = await Timetable.find({
        dayOfWeek: dayOfWeek,
        isActive: true
      });

      console.log(`📋 Found ${timetableEntries.length} timetable entries for Friday`);

      // Get all halls for mapping
      const halls = await Hall.find({});
      const hallMap = new Map();
      halls.forEach(hall => {
        hallMap.set(hall.hallId, hall._id);
      });

      for (const entry of timetableEntries) {
        // Find matching hall by room name
        const hallObjectId = hallMap.get(entry.room);
        
        if (!hallObjectId) {
          console.log(`⚠️ No hall found for room: ${entry.room}`);
          continue;
        }
        // Parse start and end times
        const [startHour, startMin] = entry.startTime.split(':').map(Number);
        const [endHour, endMin] = entry.endTime.split(':').map(Number);

        const startTime = new Date(targetDate);
        startTime.setHours(startHour, startMin, 0, 0);

        const endTime = new Date(targetDate);
        endTime.setHours(endHour, endMin, 0, 0);

        const sessionData = {
          timetableId: entry._id,
          hallId: hallObjectId,
          date: targetDate,
          startTime: startTime,
          endTime: endTime,
          subject: entry.subject,
          periodNumber: entry.periodNumber,
          program: entry.programName,
          year: entry.year,
          semester: entry.semester,
          expectedStudents: entry.studentIds || [],
          totalExpected: entry.studentIds ? entry.studentIds.length : 0,
          totalPresent: 0,
          totalLate: 0,
          totalAbsent: 0,
          status: 'Completed'
        };

        const session = new ClassSession(sessionData);
        await session.save();
        console.log(`✅ Created session: ${entry.subject} (${entry.startTime}-${entry.endTime})`);
      }
    }

    // Now link attendance records to sessions
    console.log('\n🔗 Linking attendance records to sessions...');
    
    const sessions = await ClassSession.find({
      date: {
        $gte: new Date('2025-10-24T00:00:00.000Z'),
        $lt: new Date('2025-10-25T00:00:00.000Z')
      }
    });

    const attendanceRecords = await Attendance.find({
      date: {
        $gte: new Date('2025-10-24T00:00:00.000Z'),
        $lt: new Date('2025-10-25T00:00:00.000Z')
      }
    });

    console.log(`📊 Found ${sessions.length} sessions and ${attendanceRecords.length} attendance records`);

    let updatedCount = 0;
    
    for (const attendance of attendanceRecords) {
      // Find matching session based on className and time overlap
      const matchingSession = sessions.find(session => {
        const classNameMatch = attendance.className === session.subject;
        const timeOverlap = attendance.classStartTime <= session.endTime && 
                           attendance.classEndTime >= session.startTime;
        return classNameMatch && timeOverlap;
      });

      if (matchingSession) {
        attendance.sessionId = matchingSession._id;
        await attendance.save();
        updatedCount++;
      }
    }

    console.log(`✅ Updated ${updatedCount} attendance records with session IDs`);

    // Update session statistics
    console.log('\n📈 Updating session statistics...');
    
    for (const session of sessions) {
      const sessionAttendance = await Attendance.find({ sessionId: session._id });
      
      const totalPresent = sessionAttendance.filter(a => a.status === 'Present').length;
      const totalLate = sessionAttendance.filter(a => a.status === 'Late').length;
      const totalAbsent = sessionAttendance.filter(a => a.status === 'Absent').length;
      
      session.totalPresent = totalPresent;
      session.totalLate = totalLate;
      session.totalAbsent = totalAbsent;
      session.totalExpected = totalPresent + totalLate + totalAbsent;
      
      await session.save();
      console.log(`📊 Updated ${session.subject}: ${totalPresent}P/${totalLate}L/${totalAbsent}A`);
    }

    console.log('\n🎉 Attendance-Session linkage completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

fixAttendanceSessionLinkage();