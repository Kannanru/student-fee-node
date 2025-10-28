require('dotenv').config();
const mongoose = require('mongoose');
const Hall = require('../models/Hall');
const Student = require('../models/Student');
const Timetable = require('../models/Timetable');
const ClassSession = require('../models/ClassSession');
const AttendanceEvent = require('../models/AttendanceEvent');

async function checkSystemStatus() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
    await mongoose.connect(uri);
    
    console.log('\n📊 REAL-TIME ATTENDANCE SYSTEM STATUS\n');
    console.log('═'.repeat(60));

    // Check Halls
    const halls = await Hall.find();
    console.log('\n🏛️  HALLS:');
    console.log(`   Total: ${halls.length}`);
    halls.forEach(h => {
      console.log(`   - ${h.hallId}: ${h.hallName} (${h.cameraStatus})`);
    });

    // Check Students
    const students = await Student.find();
    console.log(`\n👨‍🎓 STUDENTS:`);
    console.log(`   Total: ${students.length}`);
    const byProgram = students.reduce((acc, s) => {
      acc[s.programName] = (acc[s.programName] || 0) + 1;
      return acc;
    }, {});
    Object.entries(byProgram).forEach(([program, count]) => {
      console.log(`   - ${program}: ${count} students`);
    });

    // Check Timetables
    const timetables = await Timetable.find();
    console.log(`\n📅 TIMETABLE ENTRIES:`);
    console.log(`   Total: ${timetables.length}`);
    
    const today = new Date().getDay();
    const todayEntries = timetables.filter(t => t.dayOfWeek === today);
    console.log(`   Today's classes: ${todayEntries.length}`);

    // Check Active Sessions
    const activeSessions = await ClassSession.find({ 
      status: 'in_progress',
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });
    console.log(`\n🏫 ACTIVE SESSIONS TODAY:`);
    console.log(`   Total: ${activeSessions.length}`);
    activeSessions.forEach(session => {
      console.log(`   - ${session.subject} (${session.periodNumber}) - Expected: ${session.expectedStudents.length} students`);
    });

    // Check Recent Attendance Events
    const today0AM = new Date();
    today0AM.setHours(0, 0, 0, 0);
    
    const todayEvents = await AttendanceEvent.find({
      timestamp: { $gte: today0AM }
    }).sort({ timestamp: -1 });

    console.log(`\n📡 ATTENDANCE EVENTS TODAY:`);
    console.log(`   Total events: ${todayEvents.length}`);
    
    if (todayEvents.length > 0) {
      const statusCount = todayEvents.reduce((acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      }, {});
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count}`);
      });

      console.log(`\n   📌 Last 5 Events:`);
      todayEvents.slice(0, 5).forEach((event, idx) => {
        const time = new Date(event.timestamp).toLocaleTimeString();
        console.log(`   ${idx + 1}. [${time}] ${event.direction} - ${event.status} (Conf: ${(event.confidence * 100).toFixed(0)}%)`);
      });
    } else {
      console.log(`   ⚠️  No events yet. Run simulation to generate events.`);
    }

    // Check Exceptions
    const exceptions = todayEvents.filter(e => 
      e.confidence < 0.85 || e.spoofAttempt || e.status === 'Exception'
    );
    console.log(`\n⚠️  EXCEPTIONS TODAY:`);
    console.log(`   Total: ${exceptions.length}`);
    if (exceptions.length > 0) {
      console.log(`   Types:`);
      exceptions.forEach(e => {
        const reason = e.spoofAttempt ? 'Spoof Detected' : 
                       e.confidence < 0.85 ? `Low Confidence (${(e.confidence * 100).toFixed(0)}%)` : 
                       'Other';
        console.log(`   - ${reason}`);
      });
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ System Status Check Complete!\n');

    console.log('🚀 QUICK ACTIONS:\n');
    console.log('1. Generate single event:');
    console.log('   http://localhost:5000/api/test-camera/generate\n');
    
    console.log('2. Start simulation (50 events):');
    console.log('   node scripts/start_realtime_simulation.js\n');
    
    console.log('3. View real-time dashboard:');
    console.log('   http://localhost:4200/attendance/realtime\n');
    
    console.log('4. View main attendance dashboard:');
    console.log('   http://localhost:4200/attendance\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkSystemStatus();
