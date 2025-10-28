/**
 * Seed Script: Quota Configurations
 * 
 * Seeds the 4 quota types used in MGDC Medical College:
 * 1. Puducherry UT - Government quota for Puducherry domicile
 * 2. All India - Central pool quota
 * 3. NRI - Non-Resident Indian quota (USD tracking)
 * 4. Self-Sustaining - Management quota
 * 
 * Run: node backend/scripts/seed_quota_configs.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuotaConfig = require('../models/QuotaConfig');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';

const quotaConfigs = [
  {
    code: 'puducherry-ut',
    name: 'Puducherry UT Quota',
    displayName: 'Puducherry UT',
    description: 'Government quota for students with Puducherry domicile as per NEET counseling',
    defaultCurrency: 'INR',
    requiresUSDTracking: false,
    seatAllocation: 100,
    eligibilityCriteria: 'Puducherry domicile certificate required. NEET rank based allocation.',
    priority: 1,
    active: true,
    metadata: {
      color: '#1976d2', // Blue
      icon: 'location_city'
    }
  },
  {
    code: 'all-india',
    name: 'All India Quota',
    displayName: 'All India',
    description: 'Central pool quota open to all Indian nationals through NEET counseling',
    defaultCurrency: 'INR',
    requiresUSDTracking: false,
    seatAllocation: 50,
    eligibilityCriteria: 'Indian nationality. NEET rank based allocation through central counseling.',
    priority: 2,
    active: true,
    metadata: {
      color: '#388e3c', // Green
      icon: 'public'
    }
  },
  {
    code: 'nri',
    name: 'NRI Quota',
    displayName: 'NRI',
    description: 'Non-Resident Indian quota with USD fee structure and INR equivalent tracking',
    defaultCurrency: 'USD',
    requiresUSDTracking: true,
    seatAllocation: 30,
    eligibilityCriteria: 'NRI/OCI/PIO status proof required. NEET qualified. Sponsor relationship proof.',
    priority: 3,
    active: true,
    metadata: {
      color: '#f57c00', // Orange
      icon: 'flight'
    }
  },
  {
    code: 'self-sustaining',
    name: 'Self-Sustaining/Management Quota',
    displayName: 'Self-Sustaining',
    description: 'Management quota for self-financed students with higher fee structure',
    defaultCurrency: 'INR',
    requiresUSDTracking: false,
    seatAllocation: 20,
    eligibilityCriteria: 'NEET qualified. No domicile restriction. Direct admission through college.',
    priority: 4,
    active: true,
    metadata: {
      color: '#7b1fa2', // Purple
      icon: 'account_balance_wallet'
    }
  }
];

async function seedQuotaConfigs() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing quota configs
    console.log('🗑️  Clearing existing quota configurations...');
    const deleteResult = await QuotaConfig.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} existing records\n`);

    // Insert new quota configs
    console.log('📝 Creating quota configurations...');
    const inserted = await QuotaConfig.insertMany(quotaConfigs);
    console.log(`✅ Created ${inserted.length} quota configurations:\n`);

    // Display created quotas
    inserted.forEach((quota, index) => {
      console.log(`${index + 1}. ${quota.displayName}`);
      console.log(`   Code: ${quota.code}`);
      console.log(`   Currency: ${quota.defaultCurrency}`);
      console.log(`   USD Tracking: ${quota.requiresUSDTracking ? 'Yes' : 'No'}`);
      console.log(`   Seats: ${quota.seatAllocation}`);
      console.log(`   Color: ${quota.metadata.color}`);
      console.log('');
    });

    // Verify counts
    const totalActive = await QuotaConfig.countDocuments({ active: true });
    console.log(`📊 Summary:`);
    console.log(`   Total Active Quotas: ${totalActive}`);
    console.log(`   USD Tracking Enabled: ${inserted.filter(q => q.requiresUSDTracking).length}`);
    console.log(`   Total Seat Allocation: ${inserted.reduce((sum, q) => sum + q.seatAllocation, 0)}`);

    console.log('\n✅ Quota configuration seeding completed successfully!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Run: node backend/scripts/seed_fee_heads.js');
    console.log('   2. Verify in MongoDB: db.quota_configs.find().pretty()');

  } catch (error) {
    console.error('❌ Error seeding quota configurations:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding
seedQuotaConfigs();
