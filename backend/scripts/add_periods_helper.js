require('dotenv').config();
const mongoose = require('mongoose');
const Timetable = require('../models/Timetable');

// Function to create timetable entry
async function createPeriod(data) {
  try {
    const entry = await Timetable.create({
      className: `${data.program}-${data.year}-${data.section}`,
      subject: data.subject,
      programName: data.program,
      year: parseInt(data.year),
      semester: parseInt(data.semester),
      academicYear: data.academicYear,
      dayOfWeek: parseInt(data.dayOfWeek),
      startTime: data.startTime,
      endTime: data.endTime,
      periodNumber: parseInt(data.periodNumber),
      facultyName: data.facultyName,
      instructor: data.facultyName,
      room: data.room,
      department: data.department || 'Dentistry',
      isActive: true
    });
    return entry;
  } catch (error) {
    throw error;
  }
}

// Example usage
(async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    // Example: Add multiple periods for BDS Year 1 Section A
    const periods = [
      {
        program: 'BDS',
        year: '1',
        section: 'A',
        subject: 'Dental Anatomy',
        semester: '1',
        academicYear: '2024-2025',
        dayOfWeek: '1', // Monday
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: '1',
        facultyName: 'Dr. Kumar',
        room: 'Lab 101',
        department: 'Dentistry'
      },
      {
        program: 'BDS',
        year: '1',
        section: 'A',
        subject: 'Oral Pathology',
        semester: '1',
        academicYear: '2024-2025',
        dayOfWeek: '1', // Monday
        startTime: '10:15',
        endTime: '11:15',
        periodNumber: '2',
        facultyName: 'Dr. Smith',
        room: 'Lab 102',
        department: 'Dentistry'
      }
      // Add more periods here...
    ];

    console.log('📝 Creating periods...\n');
    
    for (const period of periods) {
      const exists = await Timetable.findOne({
        className: `${period.program}-${period.year}-${period.section}`,
        dayOfWeek: parseInt(period.dayOfWeek),
        startTime: period.startTime,
        periodNumber: parseInt(period.periodNumber)
      });

      if (exists) {
        console.log(`⏭️  ${period.subject} - ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][period.dayOfWeek]} ${period.startTime} already exists`);
      } else {
        const entry = await createPeriod(period);
        console.log(`✅ Created: ${period.subject} - ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][period.dayOfWeek]} ${period.startTime}-${period.endTime} (Period ${period.periodNumber})`);
      }
    }

    console.log('\n✅ All periods created successfully!');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
