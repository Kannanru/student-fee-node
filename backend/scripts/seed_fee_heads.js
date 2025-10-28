/**
 * Seed Script: Fee Heads
 * 
 * Seeds the 13 predefined fee heads used in MGDC Medical College:
 * - Academic: Admission, Tuition, Library, Laboratory, Examination, University, E-Learning
 * - Hostel: Hostel Rent, Hostel Mess, Hostel Security
 * - Miscellaneous: Caution Deposit, Student Welfare, Medical Insurance
 * 
 * Run: node backend/scripts/seed_fee_heads.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const FeeHead = require('../models/FeeHead');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';

const feeHeads = [
  // ACADEMIC FEES
  {
    name: 'Admission Fee',
    code: 'ADM',
    category: 'academic',
    frequency: 'one-time',
    isRefundable: false,
    defaultAmount: 25000,
    description: 'One-time admission processing fee charged at the time of joining',
    displayOrder: 1,
    taxability: false,
    taxPercentage: 0,
    glCode: 'GL-ADM-001',
    status: 'active'
  },
  {
    name: 'Tuition Fee',
    code: 'TUT',
    category: 'academic',
    frequency: 'semester',
    isRefundable: false,
    defaultAmount: 100000,
    description: 'Main academic fee covering teaching, faculty, and curriculum costs',
    displayOrder: 2,
    taxability: false,
    taxPercentage: 0,
    glCode: 'GL-TUT-001',
    status: 'active'
  },
  {
    name: 'Library Fee',
    code: 'LIB',
    category: 'academic',
    frequency: 'annual',
    isRefundable: false,
    defaultAmount: 5000,
    description: 'Annual fee for library access, books, journals, and digital resources',
    displayOrder: 3,
    taxability: true,
    taxPercentage: 18,
    glCode: 'GL-LIB-001',
    status: 'active'
  },
  {
    name: 'Laboratory Fee',
    code: 'LAB',
    category: 'academic',
    frequency: 'semester',
    isRefundable: false,
    defaultAmount: 15000,
    description: 'Laboratory equipment, consumables, and practical training costs',
    displayOrder: 4,
    taxability: true,
    taxPercentage: 18,
    glCode: 'GL-LAB-001',
    status: 'active'
  },
  {
    name: 'Examination Fee',
    code: 'EXAM',
    category: 'academic',
    frequency: 'semester',
    isRefundable: false,
    defaultAmount: 3000,
    description: 'Internal and university examination processing and evaluation fees',
    displayOrder: 5,
    taxability: false,
    taxPercentage: 0,
    glCode: 'GL-EXAM-001',
    status: 'active'
  },
  {
    name: 'University Registration Fee',
    code: 'UNIV',
    category: 'academic',
    frequency: 'annual',
    isRefundable: false,
    defaultAmount: 10000,
    description: 'Annual university registration and affiliation fee',
    displayOrder: 6,
    taxability: false,
    taxPercentage: 0,
    glCode: 'GL-UNIV-001',
    status: 'active'
  },
  {
    name: 'E-Learning & Digital Platform Fee',
    code: 'ELEARN',
    category: 'academic',
    frequency: 'annual',
    isRefundable: false,
    defaultAmount: 4000,
    description: 'Access to online learning platform, recorded lectures, and digital content',
    displayOrder: 7,
    taxability: true,
    taxPercentage: 18,
    glCode: 'GL-ELEARN-001',
    status: 'active'
  },

  // HOSTEL FEES
  {
    name: 'Hostel Rent',
    code: 'HOST',
    category: 'hostel',
    frequency: 'semester',
    isRefundable: false,
    defaultAmount: 20000,
    description: 'Accommodation charges for hostel room with electricity and water',
    displayOrder: 8,
    taxability: true,
    taxPercentage: 12,
    glCode: 'GL-HOST-001',
    status: 'active'
  },
  {
    name: 'Hostel Mess Fee',
    code: 'MESS',
    category: 'hostel',
    frequency: 'semester',
    isRefundable: false,
    defaultAmount: 18000,
    description: 'Mess charges for meals (breakfast, lunch, dinner)',
    displayOrder: 9,
    taxability: false,
    taxPercentage: 0,
    glCode: 'GL-MESS-001',
    status: 'active'
  },
  {
    name: 'Hostel Security Deposit',
    code: 'HSEC',
    category: 'hostel',
    frequency: 'one-time',
    isRefundable: true,
    defaultAmount: 10000,
    description: 'Refundable security deposit for hostel room and amenities',
    displayOrder: 10,
    taxability: false,
    taxPercentage: 0,
    glCode: 'GL-HSEC-001',
    status: 'active'
  },

  // MISCELLANEOUS FEES
  {
    name: 'Caution Deposit',
    code: 'CAUT',
    category: 'miscellaneous',
    frequency: 'one-time',
    isRefundable: true,
    defaultAmount: 15000,
    description: 'Refundable caution deposit for college property and equipment',
    displayOrder: 11,
    taxability: false,
    taxPercentage: 0,
    glCode: 'GL-CAUT-001',
    status: 'active'
  },
  {
    name: 'Student Welfare Fund',
    code: 'SWF',
    category: 'miscellaneous',
    frequency: 'annual',
    isRefundable: false,
    defaultAmount: 2000,
    description: 'Student activities, sports, cultural events, and welfare programs',
    displayOrder: 12,
    taxability: false,
    taxPercentage: 0,
    glCode: 'GL-SWF-001',
    status: 'active'
  },
  {
    name: 'Medical Insurance',
    code: 'MEDINS',
    category: 'miscellaneous',
    frequency: 'annual',
    isRefundable: false,
    defaultAmount: 3000,
    description: 'Group medical insurance coverage for students',
    displayOrder: 13,
    taxability: true,
    taxPercentage: 18,
    glCode: 'GL-MEDINS-001',
    status: 'active'
  }
];

async function seedFeeHeads() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing fee heads
    console.log('🗑️  Clearing existing fee heads...');
    const deleteResult = await FeeHead.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} existing records\n`);

    // Insert new fee heads
    console.log('📝 Creating fee heads...');
    const inserted = await FeeHead.insertMany(feeHeads);
    console.log(`✅ Created ${inserted.length} fee heads:\n`);

    // Group by category for display
    const academic = inserted.filter(f => f.category === 'academic');
    const hostel = inserted.filter(f => f.category === 'hostel');
    const miscellaneous = inserted.filter(f => f.category === 'miscellaneous');

    console.log('📚 ACADEMIC FEES:');
    academic.forEach((fee, index) => {
      console.log(`   ${index + 1}. ${fee.name} (${fee.code})`);
      console.log(`      Amount: ₹${fee.defaultAmount.toLocaleString('en-IN')}`);
      console.log(`      Frequency: ${fee.frequency}`);
      console.log(`      Taxable: ${fee.taxability ? `Yes (${fee.taxPercentage}%)` : 'No'}`);
      console.log('');
    });

    console.log('🏨 HOSTEL FEES:');
    hostel.forEach((fee, index) => {
      console.log(`   ${index + 1}. ${fee.name} (${fee.code})`);
      console.log(`      Amount: ₹${fee.defaultAmount.toLocaleString('en-IN')}`);
      console.log(`      Frequency: ${fee.frequency}`);
      console.log(`      Refundable: ${fee.isRefundable ? 'Yes' : 'No'}`);
      console.log('');
    });

    console.log('📋 MISCELLANEOUS FEES:');
    miscellaneous.forEach((fee, index) => {
      console.log(`   ${index + 1}. ${fee.name} (${fee.code})`);
      console.log(`      Amount: ₹${fee.defaultAmount.toLocaleString('en-IN')}`);
      console.log(`      Frequency: ${fee.frequency}`);
      console.log(`      Refundable: ${fee.isRefundable ? 'Yes' : 'No'}`);
      console.log('');
    });

    // Summary statistics
    const totalOneTime = inserted.filter(f => f.frequency === 'one-time')
      .reduce((sum, f) => sum + f.defaultAmount, 0);
    const totalAnnual = inserted.filter(f => f.frequency === 'annual')
      .reduce((sum, f) => sum + f.defaultAmount, 0);
    const totalSemester = inserted.filter(f => f.frequency === 'semester')
      .reduce((sum, f) => sum + f.defaultAmount, 0);
    const refundableCount = inserted.filter(f => f.isRefundable).length;
    const taxableCount = inserted.filter(f => f.taxability).length;

    console.log('📊 SUMMARY:');
    console.log(`   Total Fee Heads: ${inserted.length}`);
    console.log(`   - Academic: ${academic.length}`);
    console.log(`   - Hostel: ${hostel.length}`);
    console.log(`   - Miscellaneous: ${miscellaneous.length}`);
    console.log('');
    console.log(`   One-Time Fees Total: ₹${totalOneTime.toLocaleString('en-IN')}`);
    console.log(`   Annual Fees Total: ₹${totalAnnual.toLocaleString('en-IN')}`);
    console.log(`   Semester Fees Total: ₹${totalSemester.toLocaleString('en-IN')}`);
    console.log('');
    console.log(`   Refundable Heads: ${refundableCount}`);
    console.log(`   Taxable Heads: ${taxableCount}`);

    console.log('\n✅ Fee heads seeding completed successfully!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Verify in MongoDB: db.fee_heads.find().pretty()');
    console.log('   2. Run: node backend/scripts/test_fee_models.js (to test relationships)');

  } catch (error) {
    console.error('❌ Error seeding fee heads:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding
seedFeeHeads();
