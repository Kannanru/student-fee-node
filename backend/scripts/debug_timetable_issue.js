require('dotenv').config();
const mongoose = require('mongoose');
const Timetable = require('../models/Timetable');

(async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    // Check what session is being returned for BDS-1-A right now
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    
    console.log(`📅 Current: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]} (${dayOfWeek})`);
    console.log(`⏰ Time: ${currentTime}\n`);

    // Find the session that the API is returning
    const apiSession = await Timetable.findOne({
      className: 'BDS-1-A',
      dayOfWeek: dayOfWeek,
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime }
    });

    if (apiSession) {
      console.log('🎯 SESSION FOUND BY API (This is what shows on real-time screen):');
      console.log('─'.repeat(80));
      console.log(`ID: ${apiSession._id}`);
      console.log(`Class Name: ${apiSession.className}`);
      console.log(`Subject: ${apiSession.subject}`);
      console.log(`Day: ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][apiSession.dayOfWeek]}`);
      console.log(`Time: ${apiSession.startTime} - ${apiSession.endTime}`);
      console.log(`Period: ${apiSession.periodNumber}`);
      console.log(`Room: ${apiSession.room || 'N/A'}`);
      console.log(`Faculty: ${apiSession.facultyName || apiSession.instructor || 'N/A'}`);
      console.log(`Hall ID: ${apiSession.hallId || 'N/A'}`);
      console.log(`Year: ${apiSession.year}`);
      console.log(`Semester: ${apiSession.semester || 'N/A'}`);
      console.log(`Created At: ${apiSession.createdAt}`);
      console.log('─'.repeat(80));
    } else {
      console.log('❌ NO SESSION FOUND for BDS-1-A at current time\n');
    }

    // Now show ALL BDS-1-A entries in timetable
    console.log('\n📋 ALL TIMETABLE ENTRIES FOR BDS-1-A:');
    console.log('─'.repeat(80));
    
    const allEntries = await Timetable.find({ 
      className: 'BDS-1-A'
    }).sort({ dayOfWeek: 1, startTime: 1 });

    if (allEntries.length === 0) {
      console.log('❌ NO ENTRIES FOUND with className "BDS-1-A"');
    } else {
      allEntries.forEach((entry, index) => {
        const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][entry.dayOfWeek];
        console.log(`\n${index + 1}. ${day} | ${entry.startTime}-${entry.endTime} | Period ${entry.periodNumber}`);
        console.log(`   Subject: ${entry.subject}`);
        console.log(`   Room: ${entry.room || 'N/A'}`);
        console.log(`   Faculty: ${entry.facultyName || entry.instructor || 'N/A'}`);
        console.log(`   ID: ${entry._id}`);
        console.log(`   Created: ${entry.createdAt}`);
      });
    }
    console.log('─'.repeat(80));

    // Check for entries with similar but wrong className formats
    console.log('\n🔍 CHECKING FOR ENTRIES WITH WRONG className FORMAT:');
    console.log('─'.repeat(80));
    
    const wrongFormat = await Timetable.find({
      $or: [
        { className: /BDS.*Year.*1.*A/i },
        { className: /Dental Anatomy.*BDS/i },
        { className: /BDS Year 1/i }
      ]
    }).sort({ dayOfWeek: 1, startTime: 1 });

    if (wrongFormat.length === 0) {
      console.log('✅ No entries with wrong format found');
    } else {
      wrongFormat.forEach((entry, index) => {
        const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][entry.dayOfWeek];
        console.log(`\n${index + 1}. ${day} | ${entry.startTime}-${entry.endTime}`);
        console.log(`   ⚠️  className: "${entry.className}" (WRONG FORMAT)`);
        console.log(`   Subject: ${entry.subject}`);
        console.log(`   Year: ${entry.year}`);
        console.log(`   ID: ${entry._id}`);
      });
    }
    console.log('─'.repeat(80));

    console.log('\n💡 SOLUTION:');
    console.log('─'.repeat(80));
    console.log('To add new periods to BDS-1-A timetable:');
    console.log('1. className must be EXACTLY: "BDS-1-A"');
    console.log('2. Set correct day (0=Sunday, 1=Monday, ..., 6=Saturday)');
    console.log('3. Set time range (startTime, endTime)');
    console.log('4. Set periodNumber (1, 2, 3, etc.)');
    console.log('5. All required fields: subject, year, semester, programName, academicYear');
    console.log('─'.repeat(80));

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
