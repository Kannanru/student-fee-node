// Migration script to add currentAddress field to existing students
// Run this script once to update all existing student records

require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../models/Student');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';

async function migrateStudents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find all students without currentAddress field
    const studentsToUpdate = await Student.find({
      $or: [
        { currentAddress: { $exists: false } },
        { currentAddress: null },
        { currentAddress: '' }
      ]
    });

    console.log(`\n📊 Found ${studentsToUpdate.length} students to update`);

    if (studentsToUpdate.length === 0) {
      console.log('✅ All students already have currentAddress field');
      process.exit(0);
    }

    // Ask for confirmation
    console.log('\nThis will add currentAddress field to existing students.');
    console.log('Current address will be set to permanent address by default.\n');

    let updatedCount = 0;
    let errorCount = 0;

    // Update each student
    for (const student of studentsToUpdate) {
      try {
        // Set currentAddress to permanentAddress if not already set
        student.currentAddress = student.currentAddress || student.permanentAddress;
        await student.save();
        updatedCount++;
        console.log(`✅ Updated: ${student.firstName} ${student.lastName} (${student.studentId})`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating ${student.studentId}:`, error.message);
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Successfully updated: ${updatedCount} students`);
    console.log(`   ❌ Errors: ${errorCount} students`);
    console.log('\n✅ Migration completed!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run migration
migrateStudents();
