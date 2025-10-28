const mongoose = require('mongoose');
const Fee = require('../models/Fee');
const Student = require('../models/Student');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mgdc_fees');

async function addLastWeekPayments() {
  try {
    console.log('🚀 Adding payments for last week...\n');

    // Get fees without recent payments
    const fees = await Fee.find().populate('studentId').limit(15);
    
    const paymentDates = [
      new Date('2025-10-20'), // Last Sunday
      new Date('2025-10-21'), // Last Monday  
      new Date('2025-10-22'), // Last Tuesday
      new Date('2025-10-23'), // Last Wednesday
      new Date('2025-10-24'), // Last Thursday
      new Date('2025-10-25'), // Last Friday
      new Date('2025-10-26'), // Yesterday
      new Date('2025-10-27')  // Today
    ];
    
    let paymentCount = 0;
    
    for (let i = 0; i < fees.length; i++) {
      const fee = fees[i];
      
      // Skip if already has recent payment
      if (fee.paymentHistory && fee.paymentHistory.length > 0) {
        const lastPayment = fee.paymentHistory[fee.paymentHistory.length - 1];
        if (lastPayment.paymentDate && lastPayment.paymentDate >= new Date('2025-10-20')) {
          continue; // Skip if already has payment in last week
        }
      }
      
      // Add 1-2 payments per student
      const numPayments = Math.random() > 0.7 ? 2 : 1;
      
      for (let j = 0; j < numPayments; j++) {
        const paymentDate = paymentDates[Math.floor(Math.random() * paymentDates.length)];
        const newPaymentDate = new Date(paymentDate);
        newPaymentDate.setHours(Math.floor(Math.random() * 8) + 9); // 9 AM to 5 PM
        newPaymentDate.setMinutes(Math.floor(Math.random() * 60));
        
        const paymentAmount = Math.floor(Math.random() * 25000) + 5000; // 5000-30000
        const paymentModes = ['UPI', 'Credit Card', 'Net Banking', 'Cash', 'Bank Transfer'];
        
        const paymentHistory = {
          paymentDate: newPaymentDate,
          amountPaid: paymentAmount,
          paymentMode: paymentModes[Math.floor(Math.random() * paymentModes.length)],
          transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
          receiptNumber: `RCP${Date.now()}${Math.floor(Math.random() * 1000)}`,
          paymentStatus: 'Successful',
          balanceAfterPayment: Math.max(0, (fee.totalAmount || 50000) - paymentAmount),
          paymentGateway: Math.random() > 0.5 ? 'Razorpay' : 'HDFC'
        };

        fee.paymentHistory.push(paymentHistory);
        fee.paidAmount = (fee.paidAmount || 0) + paymentAmount;
        fee.dueAmount = Math.max(0, (fee.totalAmount || 50000) - fee.paidAmount);

        await fee.save();
        paymentCount++;
        
        console.log(`✅ ${fee.studentId?.firstName || 'Unknown'} ${fee.studentId?.lastName || ''} - ${newPaymentDate.toDateString()} - ₹${paymentAmount} - ${paymentHistory.paymentMode}`);
      }
    }
    
    console.log(`\n🎯 Added ${paymentCount} payments for last week!`);
    
    // Show summary by date
    console.log('\n📊 Payment Summary by Date:');
    for (const date of paymentDates) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const dayPayments = await Fee.aggregate([
        { $unwind: '$paymentHistory' },
        {
          $match: {
            'paymentHistory.paymentDate': {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            total: { $sum: '$paymentHistory.amountPaid' }
          }
        }
      ]);
      
      if (dayPayments.length > 0) {
        console.log(`${date.toDateString()}: ${dayPayments[0].count} payments, ₹${dayPayments[0].total.toLocaleString()}`);
      }
    }

  } catch (error) {
    console.error('❌ Error adding payments:', error);
  } finally {
    mongoose.connection.close();
  }
}

addLastWeekPayments();