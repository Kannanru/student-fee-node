const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mgdc_fees');

async function checkAdminUsers() {
  try {
    console.log('👤 Checking admin users...\n');

    const admins = await User.find({ role: 'admin' });
    console.log(`📊 Found ${admins.length} admin users:`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. Email: ${admin.email}`);
      console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Active: ${admin.isActive}`);
      console.log('');
    });

    if (admins.length === 0) {
      console.log('❌ No admin users found. Creating one...');
      
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newAdmin = new User({
        email: 'admin@mgdc.ac.in',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true
      });
      
      await newAdmin.save();
      console.log('✅ Admin user created successfully');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkAdminUsers();