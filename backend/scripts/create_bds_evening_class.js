require('dotenv').config();
const mongoose = require('mongoose');
const Timetable = require('../models/Timetable');

(async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    // Check if entry already exists
    const existing = await Timetable.findOne({
      className: 'BDS-1-A',
      dayOfWeek: 3, // Wednesday
      startTime: '18:30'
    });

    if (existing) {
      console.log('⏭️  Timetable entry already exists');
      console.log(`Subject: ${existing.subject}`);
      console.log(`Time: ${existing.startTime} - ${existing.endTime}`);
    } else {
      // Create new timetable entry
      const newEntry = await Timetable.create({
        className: 'BDS-1-A',
        subject: 'Dental Anatomy',
        programName: 'BDS',
        year: 1,
        semester: 1,
        academicYear: '2024-2025',
        dayOfWeek: 3, // Wednesday (0=Sunday, 3=Wednesday)
        startTime: '18:30',
        endTime: '20:00',
        periodNumber: 1,
        facultyName: 'Dr. Kumar',
        instructor: 'Dr. Kumar',
        room: 'Lab 101',
        isActive: true
      });

      console.log('✅ Successfully created timetable entry!');
      console.log(`\n📅 Day: Wednesday`);
      console.log(`⏰ Time: ${newEntry.startTime} - ${newEntry.endTime}`);
      console.log(`📚 Subject: ${newEntry.subject}`);
      console.log(`👨‍🏫 Faculty: ${newEntry.facultyName}`);
      console.log(`🏫 Class: ${newEntry.className}`);
      console.log(`🔢 Period: ${newEntry.periodNumber}`);
    }

    // Verify the entry can be found with current time
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    
    console.log(`\n🔍 Verifying with current time (${currentTime})...`);
    
    const session = await Timetable.findOne({
      className: 'BDS-1-A',
      dayOfWeek: dayOfWeek,
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime }
    });

    if (session) {
      console.log('✅ Session can be found with current time!');
    } else {
      console.log('⚠️  Session cannot be found yet (might be outside time range)');
      console.log(`   Current day: ${dayOfWeek}, Current time: ${currentTime}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
