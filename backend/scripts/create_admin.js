// scripts/create_admin.js
// Create an admin user account

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';

async function createAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'thilak.askan@gmail.com' });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin account already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔑 Role:', existingAdmin.role);
      console.log('📅 Created:', existingAdmin.createdAt);
      
      // Update password if needed
      const newPassword = 'Askan@123';
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('✅ Password updated successfully!');
      
    } else {
      // Create new admin user
      const adminData = {
        name: 'Thilak Askan',
        email: 'thilak.askan@gmail.com',
        password: await bcrypt.hash('Askan@123', 10),
        role: 'admin',
        status: 'active'
      };

      const admin = new User(adminData);
      await admin.save();

      console.log('\n✅ Admin account created successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:    thilak.askan@gmail.com');
      console.log('🔑 Password: Askan@123');
      console.log('👤 Name:     Thilak Askan');
      console.log('🎭 Role:     admin');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    console.log('\n📝 Login Instructions:');
    console.log('1. Navigate to: http://localhost:4200/login');
    console.log('2. Email: thilak.askan@gmail.com');
    console.log('3. Password: Askan@123');
    console.log('4. Click Login');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdminUser();
