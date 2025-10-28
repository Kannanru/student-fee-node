// Update attendance records to link them to sessions based on time overlap
require('dotenv').config();
const mongoose = require('mongoose');
const ClassSession = require('../models/ClassSession');
const Attendance = require('../models/Attendance');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';

async function linkAttendanceToSessions() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const targetDate = new Date('2025-10-24T09:00:00.000Z');
    console.log(`\n🔗 Linking attendance to sessions for: ${targetDate.toDateString()}`);

    // Get all sessions for October 24, 2025
    const sessions = await ClassSession.find({
      date: {
        $gte: new Date('2025-10-24T00:00:00.000Z'),
        $lt: new Date('2025-10-25T00:00:00.000Z')
      }
    }).sort({ startTime: 1 });

    // Get all attendance records for October 24, 2025
    const attendanceRecords = await Attendance.find({
      date: {
        $gte: new Date('2025-10-24T00:00:00.000Z'),
        $lt: new Date('2025-10-25T00:00:00.000Z')
      }
    });

    console.log(`📊 Found ${sessions.length} sessions and ${attendanceRecords.length} attendance records`);

    // Create time period mapping
    // Morning sessions (8:00-12:00) should match "General Medicine" attendance
    // Afternoon sessions would match "Clinical Practice" attendance
    
    let updatedCount = 0;
    const sessionUpdates = new Map();

    for (const attendance of attendanceRecords) {
      let matchingSession = null;

      // Try to match based on time overlap
      for (const session of sessions) {
        const attendanceStart = new Date(attendance.classStartTime);
        const attendanceEnd = new Date(attendance.classEndTime);
        const sessionStart = new Date(session.startTime);
        const sessionEnd = new Date(session.endTime);

        // Check for time overlap (even partial)
        const hasOverlap = attendanceStart < sessionEnd && attendanceEnd > sessionStart;
        
        if (hasOverlap) {
          matchingSession = session;
          break;
        }
      }

      // If no exact time match, match by morning/afternoon periods
      if (!matchingSession) {
        const attendanceHour = new Date(attendance.classStartTime).getHours();
        
        if (attendance.className === 'General Medicine' && attendanceHour < 12) {
          // Find morning session
          matchingSession = sessions.find(s => new Date(s.startTime).getHours() < 12);
        } else if (attendance.className === 'Clinical Practice' && attendanceHour >= 12) {
          // Find afternoon session  
          matchingSession = sessions.find(s => new Date(s.startTime).getHours() >= 12);
        }
      }

      if (matchingSession) {
        // Update attendance record
        attendance.sessionId = matchingSession._id;
        await attendance.save();
        updatedCount++;

        // Track session statistics
        if (!sessionUpdates.has(matchingSession._id.toString())) {
          sessionUpdates.set(matchingSession._id.toString(), {
            session: matchingSession,
            present: 0,
            late: 0,
            absent: 0
          });
        }

        const stats = sessionUpdates.get(matchingSession._id.toString());
        if (attendance.status === 'Present') stats.present++;
        else if (attendance.status === 'Late') stats.late++;
        else if (attendance.status === 'Absent') stats.absent++;
      } else {
        console.log(`⚠️ No matching session found for: ${attendance.className} at ${attendance.classStartTime}`);
      }
    }

    console.log(`✅ Updated ${updatedCount} attendance records with session IDs`);

    // Update session statistics
    console.log('\n📈 Updating session statistics...');
    
    for (const [sessionId, stats] of sessionUpdates) {
      const session = stats.session;
      session.totalPresent = stats.present;
      session.totalLate = stats.late;
      session.totalAbsent = stats.absent;
      session.totalExpected = stats.present + stats.late + stats.absent;
      
      await session.save();
      console.log(`📊 Updated ${session.subject} (${session.startTime.toISOString().substr(11,5)}): ${stats.present}P/${stats.late}L/${stats.absent}A`);
    }

    console.log('\n🎉 Attendance-Session linkage completed successfully!');

    // Test the frontend API call
    console.log('\n🧪 Testing session attendance API...');
    const testSession = sessions[0];
    if (testSession) {
      const testAttendance = await Attendance.find({ sessionId: testSession._id });
      console.log(`🔍 Session ${testSession._id} has ${testAttendance.length} attendance records`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

linkAttendanceToSessions();