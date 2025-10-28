require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../models/Student');

(async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    const students = await Student.find({ 
      programName: 'BDS', 
      year: 1, 
      section: 'A' 
    }).select('studentId firstName lastName rollNumber email').sort({ studentId: 1 });

    console.log(`📊 Total BDS Year 1 Section A Students: ${students.length}\n`);
    
    if (students.length > 0) {
      console.log('📋 Student List:');
      console.log('─'.repeat(80));
      students.forEach((student, index) => {
        console.log(`${index + 1}. ${student.studentId} | ${student.firstName} ${student.lastName} | Roll: ${student.rollNumber}`);
      });
      console.log('─'.repeat(80));
      console.log(`\n✅ All ${students.length} students are ready for the class-based dashboard!`);
    } else {
      console.log('❌ No students found');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
