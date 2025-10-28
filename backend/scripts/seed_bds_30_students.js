require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 
  'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Reyansh',
  'Ananya', 'Diya', 'Aadhya', 'Saanvi', 'Kiara', 'Navya', 'Pari', 'Aarohi',
  'Anvi', 'Ishita', 'Myra', 'Sara', 'Aanya', 'Riya', 'Anika'
];

const lastNames = [
  'Sharma', 'Verma', 'Kumar', 'Singh', 'Reddy', 'Patel', 'Gupta', 'Joshi',
  'Rao', 'Nair', 'Iyer', 'Desai', 'Mehta', 'Shah', 'Agarwal', 'Chopra',
  'Malhotra', 'Bhat', 'Kulkarni', 'Menon', 'Pillai', 'Shetty', 'Naik',
  'Jain', 'Bansal', 'Goyal', 'Srivastava', 'Pandey', 'Mishra', 'Yadav'
];

(async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const password = await bcrypt.hash('Student@123', 10);
    const students = [];

    for (let i = 1; i <= 30; i++) {
      const studentId = `BDS${String(i).padStart(6, '0')}`; // BDS000001 format
      const rollNumber = `R${String(i).padStart(3, '0')}`;
      const firstName = firstNames[i - 1];
      const lastName = lastNames[i - 1];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@student.mgdc.edu`;
      
      // Check if student already exists
      const exists = await Student.findOne({ studentId });
      if (exists) {
        console.log(`⏭️  Student ${studentId} already exists, skipping...`);
        continue;
      }

      const student = {
        studentId,
        enrollmentNumber: `EN2024BDS${String(i).padStart(3, '0')}`,
        rollNumber,
        firstName,
        lastName,
        dob: new Date(2005, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: i <= 15 ? 'Male' : 'Female',
        email,
        contactNumber: `98765${String(43210 + i).slice(-5)}`,
        permanentAddress: `${i} Student Colony, Medical Campus, Bangalore, Karnataka, PIN-560001`,
        programName: 'BDS',
        year: 1,
        section: 'A',
        admissionDate: new Date('2024-09-01'),
        academicYear: '2024-2025',
        semester: '1',
        guardianName: `${firstName} ${lastName} Guardian`,
        guardianContact: `97654${String(32100 + i).slice(-5)}`,
        guardianRelation: i % 2 === 0 ? 'Father' : 'Mother',
        emergencyContactName: `${firstName} Emergency Contact`,
        emergencyContactNumber: `96543${String(21000 + i).slice(-5)}`,
        studentType: 'full-time',
        status: 'active',
        bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][i % 8],
        nationality: 'Indian',
        religion: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist'][i % 5],
        category: ['General', 'OBC', 'SC', 'ST'][i % 4],
        password
      };

      students.push(student);
    }

    if (students.length > 0) {
      await Student.insertMany(students);
      console.log(`✅ Successfully created ${students.length} BDS Year 1 Section A students`);
      console.log(`\n📋 Student IDs: BDS000001 to BDS000030`);
      console.log(`📧 Email Pattern: firstname.lastnameN@student.mgdc.edu`);
      console.log(`🔑 Default Password: Student@123`);
      console.log(`📍 Program: BDS, Year: 1, Section: A\n`);
    } else {
      console.log('ℹ️  All 30 students already exist in the database');
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
