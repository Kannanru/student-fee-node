const mongoose = require('mongoose');
const Student = require('../models/Student');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mgdc_fees');

async function fixStudentPrograms() {
  try {
    console.log('🔧 Fixing student program data...\n');

    // Check current student data
    const students = await Student.find().limit(5);
    console.log('📊 Current student data:');
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.firstName} ${student.lastName}`);
      console.log(`   Student ID: ${student.studentId}`);
      console.log(`   Program Name: ${student.programName}`);
      console.log(`   Year: ${student.year}`);
      console.log('');
    });

    // Update students to have proper program data (use programName field)
    console.log('🎓 Setting BDS program for students without program...');
    
    const updateResult = await Student.updateMany(
      { 
        $or: [
          { programName: { $exists: false } },
          { programName: null },
          { programName: '' }
        ]
      },
      { 
        $set: { 
          programName: 'BDS'
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
      console.log(`   Program Name: ${student.programName}`);
      console.log(`   Year: ${student.year}`);
      console.log('');
    });

    // Check if students have programName set
    const studentsWithProgram = await Student.countDocuments({ programName: 'BDS' });
    console.log(`🎯 Students with BDS program: ${studentsWithProgram}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixStudentPrograms();