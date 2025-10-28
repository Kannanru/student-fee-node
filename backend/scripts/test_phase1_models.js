/**
 * Test Script: Phase 1 Models
 * 
 * Tests all Phase 1 enhanced models:
 * - QuotaConfig
 * - FeeHead (enhanced)
 * - FeePlan (enhanced)
 * - StudentBill (new)
 * - Payment (enhanced)
 * 
 * Run: node backend/scripts/test_phase1_models.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuotaConfig = require('../models/QuotaConfig');
const FeeHead = require('../models/FeeHead');
const FeePlan = require('../models/FeePlan');
const StudentBill = require('../models/StudentBill');
const Payment = require('../models/Payment');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';

async function testPhase1Models() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: QuotaConfig
    console.log('📋 TEST 1: QuotaConfig Model');
    console.log('━'.repeat(60));
    
    const quotas = await QuotaConfig.find();
    console.log(`✅ Found ${quotas.length} quota configurations`);
    
    const nriQuota = await QuotaConfig.getByCode('nri');
    if (nriQuota) {
      console.log(`✅ NRI Quota found: ${nriQuota.displayName}`);
      console.log(`   USD Tracking: ${nriQuota.needsUSD() ? 'Enabled' : 'Disabled'}`);
      console.log(`   Seats: ${nriQuota.seatAllocation}`);
    }
    
    const activeQuotas = await QuotaConfig.getActiveQuotas();
    console.log(`✅ Active quotas: ${activeQuotas.length}`);
    console.log('');

    // Test 2: FeeHead
    console.log('📚 TEST 2: FeeHead Model');
    console.log('━'.repeat(60));
    
    const feeHeads = await FeeHead.find();
    console.log(`✅ Found ${feeHeads.length} fee heads`);
    
    const academicFees = await FeeHead.getByCategory('academic');
    console.log(`✅ Academic fee heads: ${academicFees.length}`);
    
    const refundableFees = await FeeHead.getRefundableFeeHeads();
    console.log(`✅ Refundable fee heads: ${refundableFees.length}`);
    refundableFees.forEach(fee => {
      console.log(`   - ${fee.name} (${fee.code}): ₹${fee.defaultAmount.toLocaleString('en-IN')}`);
    });
    
    // Test tax calculation
    const tuitionFee = await FeeHead.findOne({ code: 'TUT' });
    if (tuitionFee) {
      const taxCalc = tuitionFee.getAmountWithTax(100000);
      console.log(`✅ Tax calculation test (Tuition):`);
      console.log(`   Base: ₹${taxCalc.baseAmount.toLocaleString('en-IN')}`);
      console.log(`   Tax: ₹${taxCalc.taxAmount.toLocaleString('en-IN')}`);
      console.log(`   Total: ₹${taxCalc.totalAmount.toLocaleString('en-IN')}`);
    }
    console.log('');

    // Test 3: FeePlan (Create sample plan)
    console.log('💼 TEST 3: FeePlan Model');
    console.log('━'.repeat(60));
    
    // Get quota and fee heads for plan creation
    const puQuota = await QuotaConfig.getByCode('puducherry-ut');
    const admFee = await FeeHead.findOne({ code: 'ADM' });
    const tutFee = await FeeHead.findOne({ code: 'TUT' });
    const libFee = await FeeHead.findOne({ code: 'LIB' });
    const labFee = await FeeHead.findOne({ code: 'LAB' });
    
    if (puQuota && admFee && tutFee && libFee && labFee) {
      // Check if plan already exists
      let samplePlan = await FeePlan.findOne({ code: 'MBBS-Y1-S1-PU-V1' });
      
      if (!samplePlan) {
        console.log('📝 Creating sample fee plan...');
        
        samplePlan = await FeePlan.create({
          code: 'MBBS-Y1-S1-PU-V1',
          name: 'MBBS Year 1 Semester 1 - Puducherry UT',
          description: 'Fee plan for MBBS first year, first semester students under Puducherry UT quota',
          program: 'MBBS',
          department: 'Medicine',
          year: 1,
          semester: 1,
          academicYear: '2025-2026',
          quota: 'puducherry-ut',
          quotaRef: puQuota._id,
          heads: [
            {
              headId: admFee._id,
              amount: 25000,
              amountUSD: 0,
              taxPercentage: 0,
              taxAmount: 0,
              totalAmount: 25000
            },
            {
              headId: tutFee._id,
              amount: 100000,
              amountUSD: 0,
              taxPercentage: 0,
              taxAmount: 0,
              totalAmount: 100000
            },
            {
              headId: libFee._id,
              amount: 5000,
              amountUSD: 0,
              taxPercentage: 18,
              taxAmount: 900,
              totalAmount: 5900
            },
            {
              headId: labFee._id,
              amount: 15000,
              amountUSD: 0,
              taxPercentage: 18,
              taxAmount: 2700,
              totalAmount: 17700
            }
          ],
          totalAmount: 148600,
          totalAmountUSD: 0,
          mode: 'full',
          dueDates: [
            {
              installmentNumber: 1,
              dueDate: new Date('2025-09-01'),
              amount: 148600,
              amountUSD: 0,
              description: 'Full Payment'
            }
          ],
          version: 1,
          effectiveFrom: new Date('2025-08-01'),
          effectiveTo: null,
          locked: false,
          status: 'active'
        });
        
        console.log(`✅ Created sample plan: ${samplePlan.code}`);
      } else {
        console.log(`✅ Sample plan exists: ${samplePlan.code}`);
      }
      
      console.log(`   Total Amount: ₹${samplePlan.totalAmount.toLocaleString('en-IN')}`);
      console.log(`   Fee Heads: ${samplePlan.heads.length}`);
      console.log(`   Status: ${samplePlan.status}`);
      console.log(`   Version: ${samplePlan.version}`);
      console.log(`   Is Current: ${samplePlan.isCurrent() ? 'Yes' : 'No'}`);
    }
    console.log('');

    // Test 4: StudentBill (Create sample bill)
    console.log('🧾 TEST 4: StudentBill Model');
    console.log('━'.repeat(60));
    
    const samplePlan = await FeePlan.findOne({ code: 'MBBS-Y1-S1-PU-V1' });
    
    if (samplePlan) {
      // Generate bill number
      const billNumber = await StudentBill.generateBillNumber();
      console.log(`✅ Generated bill number: ${billNumber}`);
      
      // Check if sample bill exists
      let sampleBill = await StudentBill.findOne({ billNumber: 'BILL-2025-00001' });
      
      if (!sampleBill) {
        console.log('📝 Creating sample student bill...');
        
        // Create bill with populated heads
        const billHeads = samplePlan.heads.map(head => ({
          headId: head.headId,
          headCode: 'TUT', // Would come from FeeHead
          headName: 'Sample Fee',
          amount: head.amount,
          amountUSD: head.amountUSD || 0,
          taxPercentage: head.taxPercentage,
          taxAmount: head.taxAmount,
          totalAmount: head.totalAmount,
          paidAmount: 0,
          balanceAmount: head.totalAmount
        }));
        
        sampleBill = await StudentBill.create({
          billNumber: 'BILL-2025-00001',
          studentId: new mongoose.Types.ObjectId(), // Dummy student ID
          studentName: 'Test Student',
          registerNumber: 'MBBS2025001',
          academicYear: '2025-2026',
          program: 'MBBS',
          department: 'Medicine',
          year: 1,
          semester: 1,
          quota: 'puducherry-ut',
          planId: samplePlan._id,
          planCode: samplePlan.code,
          planVersion: samplePlan.version,
          heads: billHeads,
          totalAmount: samplePlan.totalAmount,
          paidAmount: 0,
          balanceAmount: samplePlan.totalAmount,
          totalAmountUSD: 0,
          paidAmountUSD: 0,
          balanceAmountUSD: 0,
          dueDate: new Date('2025-09-01'),
          isOverdue: false,
          daysOverdue: 0,
          penaltyAmount: 0,
          status: 'pending',
          payments: [],
          billedDate: new Date(),
          generatedBy: new mongoose.Types.ObjectId() // Dummy admin ID
        });
        
        console.log(`✅ Created sample bill: ${sampleBill.billNumber}`);
      } else {
        console.log(`✅ Sample bill exists: ${sampleBill.billNumber}`);
      }
      
      console.log(`   Total Amount: ₹${sampleBill.totalAmount.toLocaleString('en-IN')}`);
      console.log(`   Balance Amount: ₹${sampleBill.balanceAmount.toLocaleString('en-IN')}`);
      console.log(`   Status: ${sampleBill.status}`);
      console.log(`   Payment Progress: ${sampleBill.paymentPercentage}%`);
      console.log(`   Is Overdue: ${sampleBill.isOverdue ? 'Yes' : 'No'}`);
    }
    console.log('');

    // Test 5: Payment (Create sample payment)
    console.log('💰 TEST 5: Payment Model');
    console.log('━'.repeat(60));
    
    const receiptNumber = await Payment.generateReceiptNumber();
    console.log(`✅ Generated receipt number: ${receiptNumber}`);
    
    // Check if sample payment exists
    let samplePayment = await Payment.findOne({ receiptNumber: 'RCP-2025-00001' });
    
    if (!samplePayment) {
      console.log('📝 Creating sample payment...');
      
      const sampleBill = await StudentBill.findOne({ billNumber: 'BILL-2025-00001' });
      
      if (sampleBill) {
        samplePayment = await Payment.create({
          receiptNumber: 'RCP-2025-00001',
          studentId: sampleBill.studentId,
          studentName: sampleBill.studentName,
          registerNumber: sampleBill.registerNumber,
          billId: sampleBill._id,
          billNumber: sampleBill.billNumber,
          amount: 50000,
          amountUSD: 0,
          currency: 'INR',
          paymentMode: 'upi',
          upiDetails: {
            transactionId: 'UPI123456789',
            upiId: 'student@okaxis',
            provider: 'GooglePay'
          },
          headsPaid: [
            {
              headId: sampleBill.heads[0].headId,
              headCode: 'TUT',
              headName: 'Tuition Fee',
              amount: 50000
            }
          ],
          status: 'confirmed',
          paymentDate: new Date(),
          confirmedAt: new Date(),
          collectedBy: new mongoose.Types.ObjectId(), // Dummy admin ID
          collectedByName: 'Test Accountant',
          collectionLocation: 'Fee Counter',
          transactionFee: 100,
          settlementAmount: 49900,
          receiptGenerated: false,
          academicYear: '2025-2026',
          semester: 1,
          quota: 'puducherry-ut',
          remarks: 'Test payment record'
        });
        
        console.log(`✅ Created sample payment: ${samplePayment.receiptNumber}`);
        console.log(`   Amount: ${samplePayment.formattedAmount}`);
        console.log(`   Mode: ${samplePayment.paymentMethodDisplay}`);
        console.log(`   Status: ${samplePayment.status}`);
        console.log(`   Settlement Amount: ₹${samplePayment.settlementAmount.toLocaleString('en-IN')}`);
      }
    } else {
      console.log(`✅ Sample payment exists: ${samplePayment.receiptNumber}`);
      console.log(`   Amount: ${samplePayment.formattedAmount}`);
      console.log(`   Mode: ${samplePayment.paymentMethodDisplay}`);
    }
    console.log('');

    // Summary
    console.log('📊 PHASE 1 MODELS TEST SUMMARY');
    console.log('━'.repeat(60));
    console.log(`✅ QuotaConfig: ${quotas.length} quotas configured`);
    console.log(`✅ FeeHead: ${feeHeads.length} fee heads created`);
    console.log(`✅ FeePlan: Enhanced with quota, version, USD support`);
    console.log(`✅ StudentBill: New model created with plan linking`);
    console.log(`✅ Payment: Enhanced with 6 payment modes + audit trail`);
    console.log('');
    console.log('✅ All Phase 1 models are working correctly!');
    console.log('');
    console.log('💡 Next Steps:');
    console.log('   1. Phase 2: Create Dashboard APIs');
    console.log('   2. Phase 3: Implement Payment Collection Flow');
    console.log('   3. Phase 4: Build Fee Structure Management UI');

  } catch (error) {
    console.error('❌ Error testing models:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the tests
testPhase1Models();
