const mongoose = require('mongoose');
const FeePlan = require('./models/FeePlan');
const FeeHead = require('./models/FeeHead');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';

async function createSemester2FeeStructure() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if already exists
    const existing = await FeePlan.findOne({
      code: 'BDS-Y1-S2-PU-V1'
    });

    if (existing) {
      console.log('⚠️  Fee structure for BDS Year 1 Semester 2 already exists');
      console.log(`Code: ${existing.code}`);
      console.log(`Status: ${existing.status}`);
      process.exit(0);
    }

    // Get fee heads
    const feeHeads = await FeeHead.find({ status: 'active' }).limit(5);
    
    if (feeHeads.length === 0) {
      console.log('❌ No active fee heads found. Please create fee heads first.');
      process.exit(1);
    }

    console.log(`Found ${feeHeads.length} active fee heads\n`);

    // Create fee structure for BDS Year 1 Semester 2
    const feeStructure = new FeePlan({
      code: 'BDS-Y1-S2-PU-V1',
      name: 'BDS Year 1 Semester 2 - Puducherry UT - 2025-2026',
      description: 'Fee structure for BDS first year second semester students (Puducherry UT quota)',
      program: 'BDS',
      year: 1,
      semester: 2,
      quota: 'puducherry-ut',
      academicYear: '2025-2026',
      status: 'active',
      currency: 'INR',
      heads: feeHeads.map(head => ({
        headId: head._id,
        amount: Math.floor(Math.random() * 20000) + 5000, // Random amount between 5000-25000
        amountUSD: Math.floor((Math.random() * 300) + 75), // Random USD amount
        taxAmount: 0,
        totalAmount: Math.floor(Math.random() * 20000) + 5000
      })),
      totalAmount: 0, // Will be calculated
      totalAmountUSD: 0 // Will be calculated
    });

    // Calculate totals
    feeStructure.totalAmount = feeStructure.heads.reduce((sum, h) => sum + h.totalAmount, 0);
    feeStructure.totalAmountUSD = feeStructure.heads.reduce((sum, h) => sum + h.amountUSD, 0);

    await feeStructure.save();

    console.log('✅ Fee structure created successfully!\n');
    console.log('📋 Fee Structure Details:');
    console.log('─────────────────────────────');
    console.log(`Code: ${feeStructure.code}`);
    console.log(`Name: ${feeStructure.name}`);
    console.log(`Program: ${feeStructure.program}`);
    console.log(`Year: ${feeStructure.year}`);
    console.log(`Semester: ${feeStructure.semester}`);
    console.log(`Quota: ${feeStructure.quota}`);
    console.log(`Status: ${feeStructure.status}`);
    console.log(`Total Fee Heads: ${feeStructure.heads.length}`);
    console.log(`Total Amount: ₹${feeStructure.totalAmount}`);
    console.log('');

    console.log('💡 Now the student (BDS Year 1 Semester 2) should match this fee structure!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createSemester2FeeStructure();
