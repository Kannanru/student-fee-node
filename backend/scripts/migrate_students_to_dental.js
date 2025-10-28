const mongoose = require('mongoose');
const Student = require('../models/Student');
require('dotenv').config();

async function migrateStudentsToDental() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees');
    console.log('✅ Connected to MongoDB\n');

    // Map other programs to BDS (default) or MDS based on year level
    console.log('🔄 Migrating students to BDS/MDS...\n');

    // MBBS and B.Sc Nursing students → BDS (Years 1-4)
    const undergraduatePrograms = ['MBBS', 'B.Sc Nursing', 'BAMS', 'BHMS', 'BPT', 'BSc Nursing', 'Pharmacy'];
    
    const undergraduateUpdate = await Student.updateMany(
      { programName: { $in: undergraduatePrograms } },
      { $set: { programName: 'BDS' } }
    );
    
    console.log(`✅ Migrated ${undergraduateUpdate.modifiedCount} undergraduate students to BDS`);

    // Any other programs → BDS as default
    const otherUpdate = await Student.updateMany(
      { programName: { $nin: ['BDS', 'MDS'] } },
      { $set: { programName: 'BDS' } }
    );
    
    console.log(`✅ Migrated ${otherUpdate.modifiedCount} other program students to BDS`);

    // Show final summary
    console.log('\n📊 Final Student Distribution:');
    const bdsCount = await Student.countDocuments({ programName: 'BDS' });
    const mdsCount = await Student.countDocuments({ programName: 'MDS' });
    const otherCount = await Student.countDocuments({ programName: { $nin: ['BDS', 'MDS'] } });
    
    console.log(`   BDS Students: ${bdsCount}`);
    console.log(`   MDS Students: ${mdsCount}`);
    console.log(`   Other Programs: ${otherCount}`);
    
    if (otherCount === 0) {
      console.log('\n✅ All students successfully migrated to BDS/MDS!');
    } else {
      console.log('\n⚠️  Some students still have other programs');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrateStudentsToDental();
