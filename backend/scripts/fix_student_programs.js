const mongoose = require('mongoose');
const Student = require('../models/Student');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mgdc_fees');

async function fixStudentPrograms() {
  try {
    console.log('🔧 Fixing student program data...\n');

    // Check current student data
    const students = await Student.find().limit(10);
    console.log('📊 Current student data:');
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.firstName} ${student.lastName}`);
      console.log(`   Student ID: ${student.studentId}`);
      console.log(`   Program: ${student.program}`);
      console.log(`   Year: ${student.year}`);
      console.log(`   Department: ${student.department}`);
      console.log('');
    });

    // Update students to have proper program data
    console.log('🎓 Setting BDS program for all students...');
    
    const updateResult = await Student.updateMany(
      { program: { $in: [null, undefined, ''] } },
      { 
        $set: { 
          program: 'BDS',
          department: 'Dental Sciences'
        } 
      }
    );
    
    console.log(`✅ Updated ${updateResult.modifiedCount} students with BDS program`);
    
    // Verify the update
    const updatedStudents = await Student.find().limit(5);
    console.log('\n📋 Updated student data:');
    updatedStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.firstName} ${student.lastName}`);
      console.log(`   Student ID: ${student.studentId}`);
      console.log(`   Program: ${student.program}`);
      console.log(`   Year: ${student.year}`);
      console.log(`   Department: ${student.department}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixStudentPrograms();