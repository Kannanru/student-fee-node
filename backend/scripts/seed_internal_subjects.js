const mongoose = require('mongoose');
require('dotenv').config();

const InternalSubject = require('../models/InternalSubject');

async function seedInternalSubjects() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees');
    console.log('✅ Connected to MongoDB\n');

    // Clear existing subjects
    await InternalSubject.deleteMany({});
    console.log('🗑️  Cleared existing subjects\n');

    // BDS Year 1 Subjects
    const bdsYear1Subjects = [
      { code: 'ANAT101', name: 'Human Anatomy', semester: 1, maxMarks: 100, passingMarks: 50, credits: 5 },
      { code: 'PHYS101', name: 'Physiology', semester: 1, maxMarks: 100, passingMarks: 50, credits: 5 },
      { code: 'BIOC101', name: 'Biochemistry', semester: 1, maxMarks: 100, passingMarks: 50, credits: 4 },
      { code: 'DMAT101', name: 'Dental Materials', semester: 1, maxMarks: 100, passingMarks: 50, credits: 3 },
      { code: 'ANAT102', name: 'General & Dental Anatomy', semester: 2, maxMarks: 100, passingMarks: 50, credits: 5 },
      { code: 'PHYS102', name: 'General & Dental Physiology', semester: 2, maxMarks: 100, passingMarks: 50, credits: 5 },
      { code: 'BIOC102', name: 'General & Dental Biochemistry', semester: 2, maxMarks: 100, passingMarks: 50, credits: 4 }
    ];

    // MBBS Year 1 Subjects
    const mbbsYear1Subjects = [
      { code: 'ANAT001', name: 'Anatomy', semester: 1, maxMarks: 100, passingMarks: 50, credits: 6 },
      { code: 'PHYS001', name: 'Physiology', semester: 1, maxMarks: 100, passingMarks: 50, credits: 6 },
      { code: 'BIOC001', name: 'Biochemistry', semester: 1, maxMarks: 100, passingMarks: 50, credits: 5 },
      { code: 'ANAT002', name: 'Anatomy - II', semester: 2, maxMarks: 100, passingMarks: 50, credits: 6 },
      { code: 'PHYS002', name: 'Physiology - II', semester: 2, maxMarks: 100, passingMarks: 50, credits: 6 },
      { code: 'BIOC002', name: 'Biochemistry - II', semester: 2, maxMarks: 100, passingMarks: 50, credits: 5 }
    ];

    const subjects = [];

    // Create BDS subjects
    for (const subject of bdsYear1Subjects) {
      subjects.push({
        subjectCode: subject.code,
        subjectName: subject.name,
        department: 'BDS',
        year: 1,
        semester: subject.semester,
        maxMarks: subject.maxMarks,
        passingMarks: subject.passingMarks,
        credits: subject.credits,
        description: `${subject.name} - BDS Year 1`,
        isActive: true
      });
    }

    // Create MBBS subjects
    for (const subject of mbbsYear1Subjects) {
      subjects.push({
        subjectCode: subject.code,
        subjectName: subject.name,
        department: 'MBBS',
        year: 1,
        semester: subject.semester,
        maxMarks: subject.maxMarks,
        passingMarks: subject.passingMarks,
        credits: subject.credits,
        description: `${subject.name} - MBBS Year 1`,
        isActive: true
      });
    }

    // Insert subjects
    const created = await InternalSubject.insertMany(subjects);
    console.log(`✅ Created ${created.length} subjects:\n`);

    // Group by department
    const groupedSubjects = {};
    created.forEach(subject => {
      if (!groupedSubjects[subject.department]) {
        groupedSubjects[subject.department] = [];
      }
      groupedSubjects[subject.department].push(subject);
    });

    // Display summary
    Object.keys(groupedSubjects).forEach(dept => {
      console.log(`\n📚 ${dept} Department (${groupedSubjects[dept].length} subjects):`);
      groupedSubjects[dept].forEach(subject => {
        console.log(`   - ${subject.subjectCode}: ${subject.subjectName} (Sem ${subject.semester})`);
      });
    });

    console.log('\n\n🎉 Internal marks subjects seeded successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Navigate to /internal-marks/subjects to view the subject master');
    console.log('   2. Go to any student detail page and select "Internal Marks" tab');
    console.log('   3. Select academic year and enter marks for subjects\n');

  } catch (error) {
    console.error('❌ Error seeding subjects:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedInternalSubjects();
