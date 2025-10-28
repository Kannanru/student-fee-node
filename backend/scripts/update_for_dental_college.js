const mongoose = require('mongoose');
const Student = require('../models/Student');
const Timetable = require('../models/Timetable');
require('dotenv').config();

async function updateForDentalCollege() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees');
    console.log('✅ Connected to MongoDB\n');

    // 1. Update all students to set default section='A' if missing
    console.log('📚 Updating students...');
    const studentUpdate = await Student.updateMany(
      { section: { $exists: false } },
      { $set: { section: 'A' } }
    );
    console.log(`   Updated ${studentUpdate.modifiedCount} students with default section='A'\n`);

    // 2. Update timetable entries - remove section from className
    console.log('📅 Updating timetable entries...');
    
    const timetables = await Timetable.find({});
    let updated = 0;
    
    for (const timetable of timetables) {
      if (timetable.programName && timetable.year) {
        const newClassName = `${timetable.programName}-${timetable.year}`;
        
        // Only update if className is different
        if (timetable.className !== newClassName) {
          timetable.className = newClassName;
          // Set default section if missing
          if (!timetable.section) {
            timetable.section = 'A';
          }
          // Set default semester if missing
          if (!timetable.semester) {
            timetable.semester = 1;
          }
          await timetable.save();
          updated++;
          console.log(`   Updated: "${timetable.className}" → "${newClassName}" (${timetable.subject})`);
        }
      }
    }
    
    console.log(`\n   Updated ${updated} timetable entries\n`);

    // 3. Show summary
    console.log('📊 Summary:');
    const bdsStudents = await Student.countDocuments({ programName: 'BDS' });
    const mdsStudents = await Student.countDocuments({ programName: 'MDS' });
    const otherStudents = await Student.countDocuments({ programName: { $nin: ['BDS', 'MDS'] } });
    
    console.log(`   BDS Students: ${bdsStudents}`);
    console.log(`   MDS Students: ${mdsStudents}`);
    console.log(`   Other Programs: ${otherStudents}`);
    
    if (otherStudents > 0) {
      console.log('\n⚠️  Warning: Found students with programs other than BDS/MDS');
      console.log('   These students may need manual review/migration');
      
      const others = await Student.find({ programName: { $nin: ['BDS', 'MDS'] } })
        .select('studentId programName year')
        .limit(10);
      
      console.log('\n   Sample records:');
      others.forEach(s => {
        console.log(`   - ${s.studentId}: ${s.programName} Year ${s.year}`);
      });
    }

    console.log('\n✅ Update complete!');
    console.log('\n📌 Changes made:');
    console.log('   - Students: Default section set to "A"');
    console.log('   - Timetables: className format changed to "PROGRAM-YEAR" (e.g., BDS-1)');
    console.log('   - Removed section requirement from system');
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

updateForDentalCollege();
