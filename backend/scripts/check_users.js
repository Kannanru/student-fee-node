// Check existing users in database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';

async function checkUsers() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const users = await User.find({}).select('email role firstName lastName status');
    console.log(`\n📚 Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.role} - ${user.firstName} ${user.lastName} (${user.status})`);
    });

    if (users.length === 0) {
      console.log('\n❌ No users found in database');
      console.log('💡 You may need to run a seeding script to create default users');
    } else {
      console.log('\n💡 Try logging in through the frontend at http://localhost:4200');
      console.log('💡 Or create a test user if none of these work');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkUsers();