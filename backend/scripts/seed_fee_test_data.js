const mongoose = require('mongoose');
const FeeHead = require('../models/FeeHead');
const QuotaConfig = require('../models/QuotaConfig');

const mongoUri = 'mongodb://localhost:27017/mgdc_fees';

async function seedTestData() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    // Check existing fee heads
    const existingHeads = await FeeHead.find();
    console.log(`\n📊 Found ${existingHeads.length} existing fee heads`);

    if (existingHeads.length === 0) {
      console.log('\n🌱 Seeding sample fee heads...');
      
      const sampleFeeHeads = [
        {
          name: 'Tuition Fee',
          code: 'TF',
          category: 'academic',
          frequency: 'semester',
          defaultAmount: 50000,
          taxability: true,
          taxPercentage: 18,
          isRefundable: false,
          status: 'active',
          displayOrder: 1
        },
        {
          name: 'Library Fee',
          code: 'LF',
          category: 'academic',
          frequency: 'annual',
          defaultAmount: 5000,
          taxability: true,
          taxPercentage: 18,
          isRefundable: true,
          status: 'active',
          displayOrder: 2
        },
        {
          name: 'Laboratory Fee',
          code: 'LAB',
          category: 'academic',
          frequency: 'semester',
          defaultAmount: 15000,
          taxability: true,
          taxPercentage: 18,
          isRefundable: false,
          status: 'active',
          displayOrder: 3
        },
        {
          name: 'Hostel Fee',
          code: 'HF',
          category: 'hostel',
          frequency: 'semester',
          defaultAmount: 25000,
          taxability: true,
          taxPercentage: 18,
          isRefundable: true,
          status: 'active',
          displayOrder: 4
        },
        {
          name: 'Sports Fee',
          code: 'SF',
          category: 'miscellaneous',
          frequency: 'annual',
          defaultAmount: 3000,
          taxability: false,
          taxPercentage: 0,
          isRefundable: true,
          status: 'active',
          displayOrder: 5
        },
        {
          name: 'Examination Fee',
          code: 'EF',
          category: 'academic',
          frequency: 'semester',
          defaultAmount: 2000,
          taxability: false,
          taxPercentage: 0,
          isRefundable: false,
          status: 'active',
          displayOrder: 6
        }
      ];

      await FeeHead.insertMany(sampleFeeHeads);
      console.log(`✅ Created ${sampleFeeHeads.length} fee heads`);
    } else {
      console.log('✅ Fee heads already exist');
    }

    // Check existing quotas
    const existingQuotas = await QuotaConfig.find();
    console.log(`\n📊 Found ${existingQuotas.length} existing quotas`);

    if (existingQuotas.length === 0) {
      console.log('\n🌱 Seeding sample quotas...');
      
      const sampleQuotas = [
        {
          code: 'puducherry-ut',
          name: 'Puducherry UT Quota',
          displayName: 'Puducherry UT',
          description: 'For students domiciled in Puducherry UT',
          requiresUSDTracking: false,
          defaultCurrency: 'INR',
          seatAllocation: 50,
          eligibilityCriteria: 'Domicile of Puducherry UT',
          metadata: {
            color: '#2196F3',
            icon: 'location_city'
          },
          active: true,
          priority: 1
        },
        {
          code: 'all-india',
          name: 'All India Quota',
          displayName: 'All India',
          description: 'For students from all over India',
          requiresUSDTracking: false,
          defaultCurrency: 'INR',
          seatAllocation: 30,
          eligibilityCriteria: 'NEET qualified candidates from India',
          metadata: {
            color: '#4CAF50',
            icon: 'public'
          },
          active: true,
          priority: 2
        },
        {
          code: 'nri',
          name: 'NRI Quota',
          displayName: 'NRI',
          description: 'For Non-Resident Indian students',
          requiresUSDTracking: true,
          defaultCurrency: 'USD',
          seatAllocation: 15,
          eligibilityCriteria: 'NRI status proof required',
          metadata: {
            color: '#FF9800',
            icon: 'flight'
          },
          active: true,
          priority: 3
        },
        {
          code: 'self-sustaining',
          name: 'Self-Sustaining Quota',
          displayName: 'Self-Sustaining',
          description: 'For students under self-financing scheme',
          requiresUSDTracking: false,
          defaultCurrency: 'INR',
          seatAllocation: 5,
          eligibilityCriteria: 'Management quota with higher fees',
          metadata: {
            color: '#9C27B0',
            icon: 'account_balance'
          },
          active: true,
          priority: 4
        }
      ];

      await QuotaConfig.insertMany(sampleQuotas);
      console.log(`✅ Created ${sampleQuotas.length} quotas`);
    } else {
      console.log('✅ Quotas already exist');
    }

    // Display summary
    console.log('\n📋 Summary:');
    const allHeads = await FeeHead.find({ status: 'active' });
    const allQuotas = await QuotaConfig.find({ active: true });
    
    console.log(`\n🎯 Active Fee Heads (${allHeads.length}):`);
    allHeads.forEach(head => {
      console.log(`   - ${head.name} (${head.code}): ₹${head.defaultAmount} [${head.category}]`);
      console.log(`     ID: ${head._id}`);
    });

    console.log(`\n🎯 Active Quotas (${allQuotas.length}):`);
    allQuotas.forEach(quota => {
      console.log(`   - ${quota.displayName} (${quota.code})`);
      console.log(`     ID: ${quota._id}`);
    });

    console.log('\n✅ Test data ready!');
    console.log('\n📝 Next steps:');
    console.log('   1. Open: http://localhost:5000/test-fee-structure.html');
    console.log('   2. Click "GET /api/fee-heads/active"');
    console.log('   3. Copy a fee head ID');
    console.log('   4. Fill the form and create a fee structure');

    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedTestData();
