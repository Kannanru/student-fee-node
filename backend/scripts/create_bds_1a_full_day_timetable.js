const mongoose = require('mongoose');
const Timetable = require('../models/Timetable');
require('dotenv').config();

async function createFullDayTimetable() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees');
    console.log('✅ Connected to MongoDB\n');

    // Full day schedule for BDS Year 1 Section A
    const schedule = [
      // Monday (dayOfWeek: 1)
      {
        className: 'BDS-1-A',
        subject: 'Dental Anatomy',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 1,
        academicYear: '2024-2025',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00',
        facultyName: 'Dr. Sharma',
        department: 'Dental',
        room: 'Room 101',
        notes: 'Theory class'
      },
      {
        className: 'BDS-1-A',
        subject: 'Oral Pathology',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 2,
        academicYear: '2024-2025',
        dayOfWeek: 1,
        startTime: '10:15',
        endTime: '11:15',
        facultyName: 'Dr. Patel',
        department: 'Dental',
        room: 'Room 102',
        notes: 'Theory class'
      },
      {
        className: 'BDS-1-A',
        subject: 'Dental Materials',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 3,
        academicYear: '2024-2025',
        dayOfWeek: 1,
        startTime: '11:30',
        endTime: '12:30',
        facultyName: 'Dr. Kumar',
        department: 'Dental',
        room: 'Lab 101',
        notes: 'Practical session'
      },
      // Lunch Break 12:30 - 13:30
      {
        className: 'BDS-1-A',
        subject: 'Oral Medicine',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 4,
        academicYear: '2024-2025',
        dayOfWeek: 1,
        startTime: '13:30',
        endTime: '14:30',
        facultyName: 'Dr. Reddy',
        department: 'Dental',
        room: 'Room 103',
        notes: 'Theory class'
      },
      {
        className: 'BDS-1-A',
        subject: 'Periodontology',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 5,
        academicYear: '2024-2025',
        dayOfWeek: 1,
        startTime: '14:45',
        endTime: '15:45',
        facultyName: 'Dr. Singh',
        department: 'Dental',
        room: 'Room 104',
        notes: 'Theory class'
      },

      // Tuesday (dayOfWeek: 2)
      {
        className: 'BDS-1-A',
        subject: 'Oral Pathology',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 1,
        academicYear: '2024-2025',
        dayOfWeek: 2,
        startTime: '09:00',
        endTime: '10:00',
        facultyName: 'Dr. Patel',
        department: 'Dental',
        room: 'Room 102',
        notes: 'Theory class'
      },
      {
        className: 'BDS-1-A',
        subject: 'Dental Anatomy',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 2,
        academicYear: '2024-2025',
        dayOfWeek: 2,
        startTime: '10:15',
        endTime: '11:15',
        facultyName: 'Dr. Sharma',
        department: 'Dental',
        room: 'Lab 102',
        notes: 'Practical session'
      },
      {
        className: 'BDS-1-A',
        subject: 'Prosthodontics',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 3,
        academicYear: '2024-2025',
        dayOfWeek: 2,
        startTime: '11:30',
        endTime: '12:30',
        facultyName: 'Dr. Verma',
        department: 'Dental',
        room: 'Room 105',
        notes: 'Theory class'
      },
      {
        className: 'BDS-1-A',
        subject: 'Oral Medicine',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 4,
        academicYear: '2024-2025',
        dayOfWeek: 2,
        startTime: '13:30',
        endTime: '14:30',
        facultyName: 'Dr. Reddy',
        department: 'Dental',
        room: 'Lab 103',
        notes: 'Practical session'
      },
      {
        className: 'BDS-1-A',
        subject: 'Periodontology',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 5,
        academicYear: '2024-2025',
        dayOfWeek: 2,
        startTime: '14:45',
        endTime: '15:45',
        facultyName: 'Dr. Singh',
        department: 'Dental',
        room: 'Lab 104',
        notes: 'Practical session'
      },

      // Wednesday (dayOfWeek: 3)
      {
        className: 'BDS-1-A',
        subject: 'Dental Materials',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 1,
        academicYear: '2024-2025',
        dayOfWeek: 3,
        startTime: '09:00',
        endTime: '10:00',
        facultyName: 'Dr. Kumar',
        department: 'Dental',
        room: 'Room 101',
        notes: 'Theory class'
      },
      {
        className: 'BDS-1-A',
        subject: 'Prosthodontics',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 2,
        academicYear: '2024-2025',
        dayOfWeek: 3,
        startTime: '10:15',
        endTime: '11:15',
        facultyName: 'Dr. Verma',
        department: 'Dental',
        room: 'Lab 101',
        notes: 'Practical session'
      },
      {
        className: 'BDS-1-A',
        subject: 'Oral Pathology',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 3,
        academicYear: '2024-2025',
        dayOfWeek: 3,
        startTime: '11:30',
        endTime: '12:30',
        facultyName: 'Dr. Patel',
        department: 'Dental',
        room: 'Room 102',
        notes: 'Theory class'
      },
      {
        className: 'BDS-1-A',
        subject: 'Dental Anatomy',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 4,
        academicYear: '2024-2025',
        dayOfWeek: 3,
        startTime: '13:30',
        endTime: '14:30',
        facultyName: 'Dr. Sharma',
        department: 'Dental',
        room: 'Room 103',
        notes: 'Theory class'
      },
      {
        className: 'BDS-1-A',
        subject: 'Periodontology',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 5,
        academicYear: '2024-2025',
        dayOfWeek: 3,
        startTime: '14:45',
        endTime: '15:45',
        facultyName: 'Dr. Singh',
        department: 'Dental',
        room: 'Lab 102',
        notes: 'Practical session'
      },
      // Evening class
      {
        className: 'BDS-1-A',
        subject: 'Dental Anatomy',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 6,
        academicYear: '2024-2025',
        dayOfWeek: 3,
        startTime: '18:30',
        endTime: '20:00',
        facultyName: 'Dr. Kumar',
        department: 'Dental',
        room: 'Lab 101',
        notes: 'Evening practical session'
      },

      // Thursday (dayOfWeek: 4)
      {
        className: 'BDS-1-A',
        subject: 'Oral Medicine',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 1,
        academicYear: '2024-2025',
        dayOfWeek: 4,
        startTime: '09:00',
        endTime: '10:00',
        facultyName: 'Dr. Reddy',
        department: 'Dental',
        room: 'Room 103',
        notes: 'Theory class'
      },
      {
        className: 'BDS-1-A',
        subject: 'Dental Anatomy',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 2,
        academicYear: '2024-2025',
        dayOfWeek: 4,
        startTime: '10:15',
        endTime: '11:15',
        facultyName: 'Dr. Sharma',
        department: 'Dental',
        room: 'Lab 103',
        notes: 'Practical session'
      },
      {
        className: 'BDS-1-A',
        subject: 'Prosthodontics',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 3,
        academicYear: '2024-2025',
        dayOfWeek: 4,
        startTime: '11:30',
        endTime: '12:30',
        facultyName: 'Dr. Verma',
        department: 'Dental',
        room: 'Room 105',
        notes: 'Theory class'
      },
      {
        className: 'BDS-1-A',
        subject: 'Dental Materials',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 4,
        academicYear: '2024-2025',
        dayOfWeek: 4,
        startTime: '13:30',
        endTime: '14:30',
        facultyName: 'Dr. Kumar',
        department: 'Dental',
        room: 'Lab 101',
        notes: 'Practical session'
      },
      {
        className: 'BDS-1-A',
        subject: 'Periodontology',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 5,
        academicYear: '2024-2025',
        dayOfWeek: 4,
        startTime: '14:45',
        endTime: '15:45',
        facultyName: 'Dr. Singh',
        department: 'Dental',
        room: 'Room 104',
        notes: 'Theory class'
      },

      // Friday (dayOfWeek: 5)
      {
        className: 'BDS-1-A',
        subject: 'Periodontology',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 1,
        academicYear: '2024-2025',
        dayOfWeek: 5,
        startTime: '09:00',
        endTime: '10:00',
        facultyName: 'Dr. Singh',
        department: 'Dental',
        room: 'Room 104',
        notes: 'Theory class'
      },
      {
        className: 'BDS-1-A',
        subject: 'Prosthodontics',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 2,
        academicYear: '2024-2025',
        dayOfWeek: 5,
        startTime: '10:15',
        endTime: '11:15',
        facultyName: 'Dr. Verma',
        department: 'Dental',
        room: 'Lab 102',
        notes: 'Practical session'
      },
      {
        className: 'BDS-1-A',
        subject: 'Oral Medicine',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 3,
        academicYear: '2024-2025',
        dayOfWeek: 5,
        startTime: '11:30',
        endTime: '12:30',
        facultyName: 'Dr. Reddy',
        department: 'Dental',
        room: 'Room 103',
        notes: 'Theory class'
      },
      {
        className: 'BDS-1-A',
        subject: 'Dental Materials',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 4,
        academicYear: '2024-2025',
        dayOfWeek: 5,
        startTime: '13:30',
        endTime: '14:30',
        facultyName: 'Dr. Kumar',
        department: 'Dental',
        room: 'Room 101',
        notes: 'Theory class'
      },
      {
        className: 'BDS-1-A',
        subject: 'Dental Anatomy',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 5,
        academicYear: '2024-2025',
        dayOfWeek: 5,
        startTime: '14:45',
        endTime: '15:45',
        facultyName: 'Dr. Sharma',
        department: 'Dental',
        room: 'Lab 104',
        notes: 'Practical session'
      },

      // Saturday (dayOfWeek: 6)
      {
        className: 'BDS-1-A',
        subject: 'Dental Anatomy',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 1,
        academicYear: '2024-2025',
        dayOfWeek: 6,
        startTime: '09:00',
        endTime: '10:00',
        facultyName: 'Dr. Sharma',
        department: 'Dental',
        room: 'Room 101',
        notes: 'Theory class'
      },
      {
        className: 'BDS-1-A',
        subject: 'Oral Pathology',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 2,
        academicYear: '2024-2025',
        dayOfWeek: 6,
        startTime: '10:15',
        endTime: '11:15',
        facultyName: 'Dr. Patel',
        department: 'Dental',
        room: 'Lab 103',
        notes: 'Practical session'
      },
      {
        className: 'BDS-1-A',
        subject: 'Prosthodontics',
        programName: 'BDS',
        year: 1,
        section: 'A',
        semester: 1,
        periodNumber: 3,
        academicYear: '2024-2025',
        dayOfWeek: 6,
        startTime: '11:30',
        endTime: '12:30',
        facultyName: 'Dr. Verma',
        department: 'Dental',
        room: 'Room 105',
        notes: 'Tutorial session'
      }
    ];

    console.log(`📚 Creating ${schedule.length} periods for BDS Year 1 Section A...\n`);

    // Delete existing BDS-1-A entries to avoid duplicates
    const deleteResult = await Timetable.deleteMany({ className: 'BDS-1-A' });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing BDS-1-A entries\n`);

    // Insert new schedule
    const result = await Timetable.insertMany(schedule);
    
    console.log(`✅ Successfully created ${result.length} periods!\n`);
    
    // Group by day and display
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let day = 1; day <= 6; day++) {
      const dayPeriods = schedule.filter(p => p.dayOfWeek === day);
      if (dayPeriods.length > 0) {
        console.log(`\n📅 ${days[day]} (${dayPeriods.length} periods):`);
        dayPeriods.forEach(p => {
          console.log(`   Period ${p.periodNumber}: ${p.startTime}-${p.endTime} | ${p.subject} | ${p.facultyName} | ${p.room}`);
        });
      }
    }

    console.log('\n✅ Full week timetable created for BDS Year 1 Section A!');
    console.log('\n📌 Note:ClassName format is "BDS-1-A" (correct format for real-time dashboard)');
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createFullDayTimetable();
