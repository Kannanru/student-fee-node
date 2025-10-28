const mongoose = require('mongoose');
const Fee = require('../models/Fee');
const Student = require('../models/Student'); // Add Student model

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mgdc_fees');

async function addTodayPayments() {
  try {
    console.log('🚀 Adding today\'s fee payments for testing...');

    // Get today's date
    const today = new Date();
    today.setHours(Math.floor(Math.random() * 12) + 8); // Random hour between 8 AM and 8 PM
    today.setMinutes(Math.floor(Math.random() * 60));
    today.setSeconds(Math.floor(Math.random() * 60));

    // Get some fees without payment history or with partial payments
    const fees = await Fee.find({
      $or: [
        { paymentHistory: { $size: 0 } },
        { dueAmount: { $gt: 0 } }
      ]
    }).populate('studentId').limit(20);

    console.log(`📊 Found ${fees.length} fees eligible for payments`);

    let paymentCount = 0;
    const paymentMethods = ['UPI', 'Credit Card', 'Net Banking', 'Cash', 'Bank Transfer'];

    for (const fee of fees) {
      // 70% chance of making a payment today
      if (Math.random() > 0.3) {
        const paymentAmount = Math.min(
          fee.dueAmount || fee.totalAmount,
          Math.floor(Math.random() * 20000) + 5000 // Random payment between 5000-25000
        );

        const paymentHistory = {
          paymentDate: new Date(today),
          amountPaid: paymentAmount,
          paymentMode: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
          receiptNumber: `RCP${Date.now()}${Math.floor(Math.random() * 1000)}`,
          paymentStatus: 'Successful',
          balanceAfterPayment: Math.max(0, (fee.dueAmount || fee.totalAmount) - paymentAmount),
          paymentGateway: 'Razorpay'
        };

        // Add to payment history
        fee.paymentHistory.push(paymentHistory);
        
        // Update paid amount and due amount
        fee.paidAmount = (fee.paidAmount || 0) + paymentAmount;
        fee.dueAmount = Math.max(0, fee.totalAmount - fee.paidAmount);

        await fee.save();
        paymentCount++;

        console.log(`💰 Added payment for ${fee.studentId.firstName} ${fee.studentId.lastName}: ₹${paymentAmount}`);
      }
    }

    console.log(`✅ Added ${paymentCount} payments for today (${today.toDateString()})`);
    
    // Show summary for today
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayPayments = await Fee.aggregate([
      {
        $match: {
          'paymentHistory.paymentDate': {
            $gte: todayStart,
            $lte: todayEnd
          }
        }
      },
      { $unwind: '$paymentHistory' },
      {
        $match: {
          'paymentHistory.paymentDate': {
            $gte: todayStart,
            $lte: todayEnd
          }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$paymentHistory.amountPaid' },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    if (todayPayments.length > 0) {
      console.log('\n📈 Today\'s Payment Summary:');
      console.log(`Total Payments: ${todayPayments[0].totalCount}`);
      console.log(`Total Amount: ₹${todayPayments[0].totalAmount.toLocaleString()}`);
      console.log(`Average Payment: ₹${(todayPayments[0].totalAmount / todayPayments[0].totalCount).toFixed(2)}`);
    }

    console.log('\n🎯 Fee Reports Ready for Testing!');
    console.log(`Test Date: ${today.toDateString()}`);
    console.log('Frontend URL: http://localhost:4200/fees/reports');
    console.log('Test the "Daily Payment Report" tab with today\'s date');

  } catch (error) {
    console.error('❌ Error adding payments:', error);
  } finally {
    mongoose.connection.close();
  }
}

addTodayPayments();