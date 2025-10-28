// Debug timetable structure and hall relationships
require('dotenv').config();
const mongoose = require('mongoose');
const Timetable = require('../models/Timetable');
const Hall = require('../models/Hall');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';

async function debugTimetable() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check timetable structure for Friday
    const timetableEntries = await Timetable.find({
      dayOfWeek: 5, // Friday
      isActive: true
    }).limit(3);

    console.log('\n🔍 Sample timetable entries:');
    timetableEntries.forEach((entry, index) => {
      console.log(`${index + 1}. ${JSON.stringify(entry.toObject(), null, 2)}`);
    });

    // Check available halls
    const halls = await Hall.find({}).limit(5);
    console.log(`\n🏢 Found ${halls.length} halls:`);
    halls.forEach((hall, index) => {
      console.log(`${index + 1}. ${hall.hallId} - ${hall.hallName} (ID: ${hall._id})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

debugTimetable();