const mongoose = require('mongoose');
const Timetable = require('../models/Timetable');
require('dotenv').config();

async function cleanupWrongFormatTimetables() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find entries with wrong format (contains spaces or long descriptive names)
    const wrongFormat = await Timetable.find({
      $or: [
        { className: { $regex: /\s/ } }, // Contains spaces
        { className: { $regex: /^[^-]+-[^-]+-[^-]+-/ } }, // Too many parts
        { className: { $not: /^[A-Z]{3}-[0-9]-[A-Z]$/ } } // Doesn't match correct pattern
      ]
    });

    console.log(`\n📊 Found ${wrongFormat.length} entries with wrong format:\n`);
    
    wrongFormat.forEach((entry, index) => {
      console.log(`${index + 1}. ID: ${entry._id}`);
      console.log(`   Current className: "${entry.className}"`);
      console.log(`   Subject: ${entry.subject}`);
      console.log(`   Program: ${entry.programName}, Year: ${entry.year}, Section: ${entry.section || 'N/A'}`);
      console.log(`   Day: ${getDayName(entry.dayOfWeek)}, Time: ${entry.startTime}-${entry.endTime}`);
      console.log('');
    });

    if (wrongFormat.length === 0) {
      console.log('✅ No wrong format entries found. Database is clean!');
      await mongoose.disconnect();
      return;
    }

    // Ask for confirmation (in real scenario, use readline)
    console.log('🔧 Options:');
    console.log('1. Migrate entries (update to correct format)');
    console.log('2. Delete entries');
    console.log('3. Exit without changes\n');

    // For automated script, we'll migrate
    console.log('🔄 Starting migration to correct format...\n');

    let migrated = 0;
    let failed = 0;

    for (const entry of wrongFormat) {
      try {
        // Generate correct className
        const section = entry.section || 'A'; // Default to A if no section
        const newClassName = `${entry.programName}-${entry.year}-${section}`;
        
        console.log(`Migrating: "${entry.className}" → "${newClassName}"`);
        
        // Update the entry
        entry.className = newClassName;
        if (!entry.section) {
          entry.section = section; // Set section if missing
        }
        
        await entry.save();
        migrated++;
      } catch (error) {
        console.error(`❌ Failed to migrate ${entry._id}: ${error.message}`);
        failed++;
      }
    }

    console.log('\n✅ Migration Complete!');
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${wrongFormat.length}\n`);

    // Show updated entries
    console.log('📋 Updated entries:');
    const updated = await Timetable.find({
      className: { $regex: /^[A-Z]{3}-[0-9]-[A-Z]$/ } // Matches correct pattern
    });
    
    updated.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.className} - ${entry.subject} (${getDayName(entry.dayOfWeek)} ${entry.startTime}-${entry.endTime})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

function getDayName(dayNumber) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || 'Unknown';
}

// Run the cleanup
console.log('🧹 Timetable Format Cleanup Script');
console.log('==================================\n');
cleanupWrongFormatTimetables();
