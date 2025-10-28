require('dotenv').config();
const mongoose = require('mongoose');
const Timetable = require('../models/Timetable');

(async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    // Check current time
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sunday, 3=Wednesday
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    console.log(`📅 Current Day: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]} (${dayOfWeek})`);
    console.log(`⏰ Current Time: ${currentTime}\n`);

    // Check BDS Year 1 Section A timetable
    console.log('🔍 Searching for BDS-1-A timetable entries...\n');
    
    const allBDSEntries = await Timetable.find({ 
      className: { $regex: /BDS.*1/i }
    });
    
    console.log(`📊 Found ${allBDSEntries.length} BDS Year 1 entries:`);
    console.log('─'.repeat(100));
    
    allBDSEntries.forEach(entry => {
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][entry.dayOfWeek];
      console.log(`${day} | ${entry.startTime}-${entry.endTime} | ${entry.className} | ${entry.subjectName || entry.courseName}`);
    });
    
    console.log('─'.repeat(100));
    
    // Check specific query that API uses
    console.log('\n🔍 Checking for current session (BDS-1-A, Wednesday, 18:30-20:00)...\n');
    
    const session = await Timetable.findOne({
      className: 'BDS-1-A',
      dayOfWeek: dayOfWeek,
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime }
    });
    
    if (session) {
      console.log('✅ SESSION FOUND!');
      console.log(`Subject: ${session.subjectName || session.courseName}`);
      console.log(`Hall ID: ${session.hallId}`);
      console.log(`Time: ${session.startTime} - ${session.endTime}`);
      console.log(`Period: ${session.periodNumber}`);
      console.log(`Faculty: ${session.facultyName || session.instructor || 'N/A'}`);
    } else {
      console.log('❌ NO SESSION FOUND');
      console.log('\nPossible reasons:');
      console.log('1. className might not be exactly "BDS-1-A"');
      console.log('2. dayOfWeek might not match');
      console.log('3. Time range might not include current time');
      
      // Try alternate className formats
      console.log('\n🔍 Trying alternate className formats...\n');
      
      const alternates = ['BDS-1-A', 'BDS-1', 'BDS 1 A', 'BDS Year 1 Section A'];
      for (const className of alternates) {
        const test = await Timetable.findOne({
          className: className,
          dayOfWeek: dayOfWeek,
          startTime: { $lte: currentTime },
          endTime: { $gte: currentTime }
        });
        console.log(`${className}: ${test ? '✅ Found' : '❌ Not found'}`);
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
