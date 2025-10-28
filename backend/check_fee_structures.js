// Quick script to check and create fee structures for testing
// Run with: node check_fee_structures.js

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const Student = require('./models/Student');
    const FeePlan = require('./models/FeePlan');
    const FeeHead = require('./models/FeeHead');

    // Get first student
    const student = await Student.findOne();
    if (!student) {
      console.log('❌ No students found. Please seed the database first.');
      process.exit(1);
    }

    console.log('\n📋 Student Details:');
    console.log('─────────────────────────────');
    console.log('Name:', `${student.firstName} ${student.lastName}`);
    console.log('Student ID:', student.studentId);
    console.log('Program:', student.program || student.programName);
    console.log('Year:', student.year);
    console.log('Semester:', student.semester);
    console.log('Quota:', student.quota);

    // Check for matching fee structure
    console.log('\n🔍 Searching for matching fee structure...');
    console.log('─────────────────────────────');

    let feeStructure = await FeePlan.findOne({
      program: student.program || student.programName,
      year: student.year,
      semester: student.semester,
      quota: student.quota,
      status: 'active'
    });

    if (feeStructure) {
      console.log('✅ Exact match found:', feeStructure.code);
      console.log('   Name:', feeStructure.name);
      console.log('   Total Amount:', feeStructure.totalAmount);
      console.log('   Fee Heads:', feeStructure.heads.length);
    } else {
      console.log('❌ No exact match found');
      
      // Try without quota
      feeStructure = await FeePlan.findOne({
        program: student.program || student.programName,
        year: student.year,
        semester: student.semester,
        status: 'active'
      });

      if (feeStructure) {
        console.log('⚠️  Found without quota:', feeStructure.code);
      } else {
        console.log('❌ No match without quota');
        
        // Try just program
        feeStructure = await FeePlan.findOne({
          program: student.program || student.programName,
          status: 'active'
        });

        if (feeStructure) {
          console.log('⚠️  Found with just program:', feeStructure.code);
        } else {
          console.log('❌ No match at all');
        }
      }
    }

    // List all active fee structures
    console.log('\n📚 All Active Fee Structures:');
    console.log('─────────────────────────────');
    const allStructures = await FeePlan.find({ status: 'active' })
      .select('code name program year semester quota totalAmount');
    
    if (allStructures.length === 0) {
      console.log('❌ No active fee structures found');
      console.log('\n💡 Creating a sample fee structure...');
      
      // Get some fee heads
      const feeHeads = await FeeHead.find({ isActive: true }).limit(5);
      if (feeHeads.length === 0) {
        console.log('❌ No active fee heads found. Please run seeder first.');
        process.exit(1);
      }

      const heads = feeHeads.map(head => ({
        headId: head._id,
        amount: head.amount,
        amountUSD: head.amountUSD || 0,
        taxPercentage: 0,
        taxAmount: 0,
        totalAmount: head.amount
      }));

      const totalAmount = heads.reduce((sum, h) => sum + h.totalAmount, 0);

      const newStructure = await FeePlan.create({
        code: `${student.program || student.programName}-Y${student.year}-S${student.semester}-${student.quota?.substring(0, 2).toUpperCase() || 'GEN'}`,
        name: `${student.program || student.programName} Year ${student.year} Semester ${student.semester} - ${student.quota || 'General'}`,
        description: 'Auto-generated for testing',
        program: student.program || student.programName,
        department: 'General',
        year: student.year,
        semester: student.semester,
        academicYear: '2025-2026',
        quota: student.quota || 'puducherry-ut',
        heads,
        totalAmount,
        totalAmountUSD: 0,
        status: 'active'
      });

      console.log('✅ Created fee structure:', newStructure.code);
      console.log('   Total Amount:', newStructure.totalAmount);
      console.log('   Fee Heads:', newStructure.heads.length);
    } else {
      console.table(allStructures.map(s => ({
        Code: s.code,
        Name: s.name,
        Program: s.program,
        Year: s.year,
        Semester: s.semester,
        Quota: s.quota,
        Amount: s.totalAmount
      })));
    }

    console.log('\n✅ Check complete!');
    console.log('\n💡 Next steps:');
    console.log('1. Restart your backend server');
    console.log('2. Try selecting a student in the fee collection page');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
