const mongoose = require('mongoose');
const Student = require('./models/Student');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';

async function updateStudentFields() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the student
    const studentId = 'STU001234';
    const student = await Student.findOne({ studentId });

    if (!student) {
      console.log('❌ Student not found');
      process.exit(1);
    }

    console.log('📋 Current Student Data:');
    console.log('─────────────────────────────');
    console.log(`Name: ${student.name}`);
    console.log(`Student ID: ${student.studentId}`);
    console.log(`Program: ${student.programName}`);
    console.log(`Semester: ${student.semester}`);
    console.log(`Year: ${student.year || 'NOT SET'}`);
    console.log(`Quota: ${student.quota || 'NOT SET'}`);
    console.log(`Admission Date: ${student.admissionDate}`);
    console.log('');

    // Calculate year from admission date if not set
    if (!student.year && student.admissionDate) {
      const admissionYear = new Date(student.admissionDate).getFullYear();
      const currentYear = new Date().getFullYear();
      const calculatedYear = currentYear - admissionYear + 1;
      
      // Make sure it's within valid range (1-5)
      student.year = Math.min(Math.max(calculatedYear, 1), 5);
      console.log(`🔧 Setting year to: ${student.year} (calculated from admission date)`);
    }

    // Set default quota if not set
    if (!student.quota) {
      student.quota = 'puducherry-ut'; // Default quota
      console.log(`🔧 Setting quota to: ${student.quota} (default)`);
    }

    // Save the student
    await student.save();
    console.log('\n✅ Student updated successfully!\n');

    console.log('📋 Updated Student Data:');
    console.log('─────────────────────────────');
    console.log(`Name: ${student.name}`);
    console.log(`Student ID: ${student.studentId}`);
    console.log(`Program: ${student.programName}`);
    console.log(`Semester: ${student.semester}`);
    console.log(`Year: ${student.year}`);
    console.log(`Quota: ${student.quota}`);
    console.log('');

    // Now try to find matching fee structure
    const FeePlan = require('./models/FeePlan');
    const studentSemester = parseInt(student.semester);
    
    const feeStructure = await FeePlan.findOne({
      program: student.programName,
      year: student.year,
      semester: studentSemester,
      quota: student.quota,
      status: 'active'
    });

    console.log('🔍 Fee Structure Match Test:');
    console.log('─────────────────────────────');
    if (feeStructure) {
      console.log(`✅ MATCH FOUND!`);
      console.log(`Code: ${feeStructure.code}`);
      console.log(`Name: ${feeStructure.name}`);
      console.log(`Program: ${feeStructure.program}`);
      console.log(`Year: ${feeStructure.year}`);
      console.log(`Semester: ${feeStructure.semester}`);
      console.log(`Quota: ${feeStructure.quota}`);
    } else {
      console.log(`❌ No exact match found`);
      console.log(`Looking for: Program=${student.programName}, Year=${student.year}, Semester=${studentSemester}, Quota=${student.quota}`);
      
      // Try fallback
      const fallbackStructure = await FeePlan.findOne({
        program: student.programName,
        status: 'active'
      });
      
      if (fallbackStructure) {
        console.log(`\n⚠️  Found fallback fee structure (program only):`);
        console.log(`Code: ${fallbackStructure.code}`);
        console.log(`Name: ${fallbackStructure.name}`);
      }
    }

    console.log('\n✅ Update complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateStudentFields();
