const mongoose = require('mongoose');
const Fee = require('../models/Fee');
const Student = require('../models/Student');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mgdc_fees');

async function testAggregation() {
  try {
    console.log('🔍 Testing daily payments aggregation...\n');

    const startOfPeriod = new Date('2025-10-20T00:00:00.000Z');
    const endOfPeriod = new Date('2025-10-27T23:59:59.999Z');
    
    console.log('Date range:', {
      from: startOfPeriod,
      to: endOfPeriod
    });

    // First, let's check what fees have payment history in this period
    const feesWithPayments = await Fee.aggregate([
      {
        $match: {
          'paymentHistory.paymentDate': {
            $gte: startOfPeriod,
            $lte: endOfPeriod
          }
        }
      }
    ]);

    console.log(`\n📊 Fees with payments in date range: ${feesWithPayments.length}`);

    // Now let's test the full pipeline step by step
    console.log('\n🔧 Testing aggregation pipeline...\n');

    const pipeline = [
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
          'student.programName': 'BDS',
          'paymentHistory': { $exists: true, $ne: [] },
          'paymentHistory.paymentDate': {
            $gte: startOfPeriod,
            $lte: endOfPeriod
          }
        }
      },
      { $unwind: '$paymentHistory' },
      {
        $match: {
          'paymentHistory.paymentDate': {
            $gte: startOfPeriod,
            $lte: endOfPeriod
          }
        }
      },
      {
        $project: {
          studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
          studentId: '$student.studentId',
          program: '$student.programName',
          year: '$student.year',
          feeHead: {
            $cond: {
              if: { $ne: ['$feeType', null] },
              then: '$feeType',
              else: {
                $cond: {
                  if: { $gt: [{ $ifNull: ['$totalAmount', 0] }, 50000] },
                  then: 'Tuition Fee',
                  else: 'Other Fees'
                }
              }
            }
          },
          amount: '$paymentHistory.amountPaid',
          paymentMethod: '$paymentHistory.paymentMode',
          transactionId: '$paymentHistory.transactionId',
          receiptNumber: '$paymentHistory.receiptNumber',
          paymentTime: '$paymentHistory.paymentDate',
          status: '$paymentHistory.paymentStatus'
        }
      },
      { $sort: { paymentTime: -1 } }
    ];
    
    const payments = await Fee.aggregate(pipeline);
    
    console.log(`✅ Aggregation successful! Found ${payments.length} payment records`);
    
    if (payments.length > 0) {
      console.log('\n📋 Sample records:');
      payments.slice(0, 3).forEach((payment, index) => {
        console.log(`${index + 1}. ${payment.studentName} - ₹${payment.amount} - ${payment.paymentMethod} - ${payment.paymentTime?.toDateString()}`);
      });
    }

    // Also test without program filter
    console.log('\n🔍 Testing without program filter...\n');
    
    const pipelineWithoutProgram = [...pipeline];
    pipelineWithoutProgram[2].$match = {
      'paymentHistory': { $exists: true, $ne: [] },
      'paymentHistory.paymentDate': {
        $gte: startOfPeriod,
        $lte: endOfPeriod
      }
    };
    
    const allPayments = await Fee.aggregate(pipelineWithoutProgram);
    console.log(`✅ Without program filter: ${allPayments.length} payment records`);
    
    if (allPayments.length > 0) {
      console.log('\n📋 All programs found:');
      const programs = [...new Set(allPayments.map(p => p.program))];
      console.log(programs);
    }

  } catch (error) {
    console.error('❌ Error testing aggregation:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAggregation();