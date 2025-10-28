// Create a test admin user for API testing
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';

async function createTestAdmin() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if test admin already exists
    const existingUser = await User.findOne({ email: 'test@admin.com' });
    if (existingUser) {
      console.log('👤 Test admin already exists: test@admin.com / admin123');
      return;
    }

    // Create new test admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const testAdmin = new User({
      name: 'Test Admin',
      email: 'test@admin.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Admin',
      role: 'admin',
      status: 'active'
    });

    await testAdmin.save();
    console.log('✅ Test admin created successfully!');
    console.log('📧 Email: test@admin.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: admin');

  } catch (error) {
    console.error('❌ Error creating test admin:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

createTestAdmin();