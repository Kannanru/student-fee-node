require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Hall = require('../models/Hall');
const Timetable = require('../models/Timetable');
const ClassSession = require('../models/ClassSession');
const AttendanceEvent = require('../models/AttendanceEvent');
const Attendance = require('../models/Attendance');

const PROGRAMS = ['MBBS', 'BDS', 'B.Sc Nursing'];
const YEARS = ['1', '2', '3', '4'];
const SECTIONS = ['A', 'B'];

async function seedRealtimeDemo() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Step 1: Create Halls with Cameras
    console.log('\n📍 Creating Halls...');
    const halls = [];
    const hallConfigs = [
      { hallId: 'HALL-A101', name: 'Anatomy Lab A-101', capacity: 60, floor: 1, building: 'Block A' },
      { hallId: 'HALL-B202', name: 'Lecture Hall B-202', capacity: 100, floor: 2, building: 'Block B' },
      { hallId: 'HALL-C301', name: 'Biochemistry Lab C-301', capacity: 50, floor: 3, building: 'Block C' },
      { hallId: 'HALL-D401', name: 'Physiology Lab D-401', capacity: 80, floor: 4, building: 'Block D' },
      { hallId: 'HALL-E101', name: 'Tutorial Room E-101', capacity: 40, floor: 1, building: 'Block E' }
    ];

    for (const config of hallConfigs) {
      const hall = await Hall.findOneAndUpdate(
        { hallId: config.hallId },
        {
          hallId: config.hallId,
          hallName: config.name,
          type: config.name.includes('Lab') ? 'Lab' : config.name.includes('Tutorial') ? 'Seminar' : 'Lecture',
          capacity: config.capacity,
          floor: config.floor,
          building: config.building,
          cameraId: `CAM-${config.hallId}`,
          cameraIp: `192.168.1.${100 + halls.length}`,
          cameraType: 'Hikvision',
          cameraStatus: 'active',
          entryDirection: 'IN',
          exitDirection: 'OUT',
          confidenceThreshold: 0.85,
          isActive: true
        },
        { upsert: true, new: true }
      );
      halls.push(hall);
      console.log(`   ✓ Created Hall: ${hall.hallName} (${hall.hallId})`);
    }

    // Step 2: Create Students
    console.log('\n👨‍🎓 Creating Students...');
    const students = [];
    const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Ananya', 'Karan', 'Neha', 'Arjun', 'Divya',
                        'Rohan', 'Pooja', 'Aditya', 'Kavya', 'Siddharth', 'Ishita', 'Varun', 'Riya', 'Nikhil', 'Sakshi'];
    const lastNames = ['Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Iyer', 'Joshi', 'Gupta', 'Rao', 'Nair'];

    for (let i = 0; i < 30; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const studentId = `STU${String(2025001 + i).padStart(7, '0')}`;
      const program = PROGRAMS[i % PROGRAMS.length];
      const year = YEARS[Math.floor(i / 10) % YEARS.length];
      const section = SECTIONS[i % SECTIONS.length];

      const student = await Student.findOneAndUpdate(
        { studentId },
        {
          studentId,
          enrollmentNumber: `EN${2025000 + i}`,
          firstName,
          lastName,
          dob: new Date(2000 + (i % 5), (i % 12), (i % 28) + 1),
          gender: i % 2 === 0 ? 'Male' : 'Female',
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@student.mgdc.edu`,
          contactNumber: `98765${String(43210 + i).padStart(5, '0')}`,
          permanentAddress: `${i + 1}, Medical College Road, City, State, PIN-123456`,
          programName: program,
          year: parseInt(year),
          semester: parseInt(year) * 2,
          section,
          admissionDate: new Date('2025-09-01'),
          academicYear: '2025-2026',
          guardianName: `Guardian of ${firstName}`,
          guardianContact: `98765${String(54320 + i).padStart(5, '0')}`,
          emergencyContactName: `Emergency ${firstName}`,
          emergencyContactNumber: `98765${String(65430 + i).padStart(5, '0')}`,
          studentType: 'full-time',
          password: await bcrypt.hash('Student@123', 10),
          faceEncodingRegistered: true,
          registrationDate: new Date()
        },
        { upsert: true, new: true }
      );
      students.push(student);
    }
    console.log(`   ✓ Created ${students.length} students`);

    // Step 3: Create Timetable Entries
    console.log('\n📅 Creating Timetable...');
    const today = new Date();
    const currentDay = today.getDay(); // 0=Sunday, 1=Monday, etc.
    const timetableEntries = [];

    const subjects = {
      'MBBS': ['Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology'],
      'BDS': ['Dental Anatomy', 'Oral Pathology', 'Orthodontics', 'Periodontology', 'Prosthodontics'],
      'B.Sc Nursing': ['Fundamentals of Nursing', 'Medical-Surgical Nursing', 'Community Health', 'Pediatric Nursing', 'Mental Health']
    };

    const timeSlots = [
      { start: '08:00', end: '10:00', period: 1 },
      { start: '10:15', end: '12:15', period: 2 },
      { start: '13:00', end: '15:00', period: 3 },
      { start: '15:15', end: '17:15', period: 4 }
    ];

    let timetableId = 0;
    for (const program of PROGRAMS) {
      for (const year of YEARS) {
        for (const section of SECTIONS) {
          // Create timetable for today and next few days
          for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
            const dayOfWeek = (currentDay + dayOffset) % 7;
            if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

            for (let slotIdx = 0; slotIdx < 2; slotIdx++) { // 2 slots per day
              const slot = timeSlots[slotIdx];
              const subject = subjects[program][slotIdx % subjects[program].length];
              const hall = halls[timetableId % halls.length];
              
              // Get students for this program/year/section
              const classStudents = students.filter(s => 
                s.programName === program && s.year === parseInt(year) && s.section === section
              );

              const timetable = await Timetable.findOneAndUpdate(
                {
                  className: `${subject} - ${program} Year ${year} ${section}`,
                  programName: program,
                  academicYear: '2025-2026',
                  dayOfWeek,
                  startTime: slot.start
                },
                {
                  className: `${subject} - ${program} Year ${year} ${section}`,
                  room: hall.hallId,
                  hallName: hall.name,
                  programName: program,
                  year: parseInt(year),
                  section,
                  academicYear: '2025-2026',
                  dayOfWeek,
                  startTime: slot.start,
                  endTime: slot.end,
                  periodNumber: slot.period,
                  subject,
                  faculty: `Dr. ${lastNames[timetableId % lastNames.length]}`,
                  studentIds: classStudents.map(s => s._id),
                  isActive: true
                },
                { upsert: true, new: true }
              );
              timetableEntries.push(timetable);
              timetableId++;
            }
          }
        }
      }
    }
    console.log(`   ✓ Created ${timetableEntries.length} timetable entries`);

    // Step 4: Create Active Class Sessions for Today
    console.log('\n🏫 Creating Active Class Sessions...');
    const todayTimetables = timetableEntries.filter(t => t.dayOfWeek === currentDay);
    const sessions = [];

    for (const timetable of todayTimetables.slice(0, 5)) { // Create 5 active sessions
      const hall = halls.find(h => h.hallId === timetable.room);
      if (!hall) continue;

      const [startHour, startMin] = timetable.startTime.split(':').map(Number);
      const [endHour, endMin] = timetable.endTime.split(':').map(Number);
      
      const sessionDate = new Date(today);
      sessionDate.setHours(0, 0, 0, 0);

      const sessionStart = new Date(sessionDate);
      sessionStart.setHours(startHour, startMin, 0, 0);
      
      const sessionEnd = new Date(sessionDate);
      sessionEnd.setHours(endHour, endMin, 0, 0);

      const session = await ClassSession.findOneAndUpdate(
        {
          timetableId: timetable._id,
          date: sessionDate
        },
        {
          timetableId: timetable._id,
          hallId: hall._id,
          subject: timetable.subject,
          faculty: timetable.faculty,
          programName: timetable.programName,
          year: timetable.year,
          section: timetable.section,
          date: sessionDate,
          startTime: sessionStart,
          endTime: sessionEnd,
          periodNumber: timetable.periodNumber,
          expectedStudents: timetable.studentIds,
          status: 'in_progress',
          isActive: true
        },
        { upsert: true, new: true }
      );
      sessions.push(session);
      console.log(`   ✓ Session: ${session.subject} in ${hall.hallName} (${timetable.startTime}-${timetable.endTime})`);
    }

    console.log('\n✅ Sample data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Halls: ${halls.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Timetable Entries: ${timetableEntries.length}`);
    console.log(`   - Active Sessions Today: ${sessions.length}`);
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Start the backend server: npm run dev');
    console.log('   2. Start the frontend: ng serve');
    console.log('   3. Navigate to /attendance/realtime to see live updates');
    console.log('   4. Generate test attendance events:');
    console.log('      - Visit: http://localhost:5000/api/test-camera/generate');
    console.log('      - Or POST: http://localhost:5000/api/test-camera/start-simulation');
    console.log('         Body: {"interval": 3000, "count": 50}');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

seedRealtimeDemo();
