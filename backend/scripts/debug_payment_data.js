const mongoose = require('mongoose');
const Fee = require('../models/Fee');
const Student = require('../models/Student');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mgdc_fees');

async function debugPaymentData() {
  try {
    console.log('🔍 Debugging payment data...\n');

    // Check total fees
    const totalFees = await Fee.countDocuments();
    console.log(`📊 Total fees in database: ${totalFees}`);

    // Check fees with payment history
    const feesWithPayments = await Fee.countDocuments({
      'paymentHistory.0': { $exists: true }
    });
    console.log(`💰 Fees with payment history: ${feesWithPayments}`);

    // Get sample fees with payments
    const sampleFees = await Fee.find({
      'paymentHistory.0': { $exists: true }
    }).populate('studentId').limit(5);

    console.log('\n📋 Sample fees with payments:');
    sampleFees.forEach((fee, index) => {
      console.log(`${index + 1}. Student: ${fee.studentId?.firstName} ${fee.studentId?.lastName}`);
      console.log(`   Program: ${fee.studentId?.program}`);
      console.log(`   Year: ${fee.studentId?.year}`);
      console.log(`   Payment History Count: ${fee.paymentHistory?.length || 0}`);
      if (fee.paymentHistory && fee.paymentHistory.length > 0) {
        const lastPayment = fee.paymentHistory[fee.paymentHistory.length - 1];
        console.log(`   Last Payment Date: ${lastPayment.paymentDate}`);
        console.log(`   Amount: ₹${lastPayment.amountPaid}`);
        console.log(`   Mode: ${lastPayment.paymentMode}`);
      }
      console.log('');
    });

    // Check payments in date range
    const fromDate = new Date('2025-10-20');
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date('2025-10-27');
    toDate.setHours(23, 59, 59, 999);

    console.log(`🗓️ Checking payments between ${fromDate.toDateString()} and ${toDate.toDateString()}`);

    const paymentsInRange = await Fee.aggregate([
      { $unwind: '$paymentHistory' },
      {
        $match: {
          'paymentHistory.paymentDate': {
            $gte: fromDate,
            $lte: toDate
          }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          paymentDate: '$paymentHistory.paymentDate',
          amount: '$paymentHistory.amountPaid',
          studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
          program: '$student.program',
          year: '$student.year'
        }
      }
    ]);

    console.log(`💳 Found ${paymentsInRange.length} payments in date range:`);
    paymentsInRange.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.studentName} (${payment.program} Year ${payment.year})`);
      console.log(`   Date: ${payment.paymentDate.toDateString()}`);
      console.log(`   Amount: ₹${payment.amount}`);
      console.log('');
    });

    // Now test with BDS filter
    const bdsPayments = await Fee.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $match: {
          'student.program': 'BDS',
          'paymentHistory': { $exists: true, $ne: [] }
        }
      },
      { $unwind: '$paymentHistory' },
      {
        $match: {
          'paymentHistory.paymentDate': {
            $gte: fromDate,
            $lte: toDate
          }
        }
      },
      {
        $project: {
          paymentDate: '$paymentHistory.paymentDate',
          amount: '$paymentHistory.amountPaid',
          studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
          program: '$student.program',
          year: '$student.year'
        }
      }
    ]);

    console.log(`🎓 BDS program payments in date range: ${bdsPayments.length}`);
    bdsPayments.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.studentName} (${payment.program} Year ${payment.year})`);
      console.log(`   Date: ${payment.paymentDate.toDateString()}`);
      console.log(`   Amount: ₹${payment.amount}`);
      console.log('');
    });

    // Check what programs we have
    const programs = await Fee.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$student.program',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('📚 Programs in database:');
    programs.forEach(program => {
      console.log(`- ${program._id}: ${program.count} fees`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugPaymentData();