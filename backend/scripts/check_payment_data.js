const mongoose = require('mongoose');
const Fee = require('../models/Fee');
const Student = require('../models/Student');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mgdc_fees');

async function checkPaymentData() {
  try {
    console.log('🔍 Checking existing payment data...\n');

    // Get all fees with payment history
    const feesWithPayments = await Fee.find({
      'paymentHistory.0': { $exists: true }
    }).populate('studentId').sort({ 'paymentHistory.paymentDate': -1 });

    console.log(`📊 Found ${feesWithPayments.length} fees with payment history`);

    if (feesWithPayments.length === 0) {
      console.log('❌ No payment history found in any fees');
      
      // Check if we have any fees at all
      const totalFees = await Fee.countDocuments();
      console.log(`Total fees in database: ${totalFees}`);
      
      if (totalFees > 0) {
        console.log('\n🔧 Let me add some sample payment data...');
        await addSamplePayments();
      }
    } else {
      console.log('\n💰 Recent Payments:');
      feesWithPayments.slice(0, 10).forEach((fee, index) => {
        if (fee.paymentHistory && fee.paymentHistory.length > 0) {
          const lastPayment = fee.paymentHistory[fee.paymentHistory.length - 1];
          console.log(`${index + 1}. ${fee.studentId?.firstName || 'Unknown'} ${fee.studentId?.lastName || ''}`);
          console.log(`   Date: ${lastPayment.paymentDate?.toDateString()}`);
          console.log(`   Amount: ₹${lastPayment.amountPaid}`);
          console.log(`   Mode: ${lastPayment.paymentMode}`);
          console.log('');
        }
      });
    }

  } catch (error) {
    console.error('❌ Error checking payment data:', error);
  } finally {
    mongoose.connection.close();
  }
}

async function addSamplePayments() {
  const fees = await Fee.find().populate('studentId').limit(10);
  
  for (let i = 0; i < fees.length; i++) {
    const fee = fees[i];
    
    // Add payments for last week (different dates)
    const paymentDates = [
      new Date('2025-10-20'), // Last Sunday
      new Date('2025-10-21'), // Last Monday
      new Date('2025-10-22'), // Last Tuesday
      new Date('2025-10-25'), // Last Friday
      new Date('2025-10-27')  // Today
    ];
    
    const paymentDate = paymentDates[i % paymentDates.length];
    paymentDate.setHours(Math.floor(Math.random() * 8) + 9); // 9 AM to 5 PM
    
    const paymentAmount = Math.floor(Math.random() * 15000) + 5000; // 5000-20000
    const paymentModes = ['UPI', 'Credit Card', 'Net Banking', 'Cash', 'Bank Transfer'];
    
    const paymentHistory = {
      paymentDate: paymentDate,
      amountPaid: paymentAmount,
      paymentMode: paymentModes[Math.floor(Math.random() * paymentModes.length)],
      transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
      receiptNumber: `RCP${Date.now()}${Math.floor(Math.random() * 1000)}`,
      paymentStatus: 'Successful',
      balanceAfterPayment: Math.max(0, (fee.totalAmount || 50000) - paymentAmount),
      paymentGateway: 'Razorpay'
    };

    fee.paymentHistory.push(paymentHistory);
    fee.paidAmount = (fee.paidAmount || 0) + paymentAmount;
    fee.dueAmount = Math.max(0, (fee.totalAmount || 50000) - fee.paidAmount);

    await fee.save();
    
    console.log(`✅ Added payment for ${fee.studentId?.firstName || 'Unknown'} on ${paymentDate.toDateString()}: ₹${paymentAmount}`);
  }
}

checkPaymentData();