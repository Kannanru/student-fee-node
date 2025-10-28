const mongoose = require('mongoose');
const Student = require('../models/Student');
const Fee = require('../models/Fee');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mgdc_fees', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function generateFeeData() {
  try {
    console.log('🚀 Generating Fee Reports Test Data...');

    // Get existing students
    const students = await Student.find().limit(50);
    console.log(`📊 Found ${students.length} students`);

    if (students.length === 0) {
      console.log('❌ No students found. Please run student seed first.');
      return;
    }

    // Clear existing fee data
    await Fee.deleteMany({});
    console.log('🧹 Cleared existing fee data');

    const programs = ['BDS', 'MBBS', 'BSc Nursing', 'MSc Nursing'];
    const academicYear = '2025-2026';
    const currentDate = new Date();
    
    let feeCount = 0;

    for (const student of students) {
      // Assign random program if not set
      if (!student.program) {
        student.program = programs[Math.floor(Math.random() * programs.length)];
        student.year = Math.floor(Math.random() * 4) + 1;
        await student.save();
      }

      // Create fee records for each semester
      for (let semester = 1; semester <= 2; semester++) {
        // Create fee breakdown with required fields
        const baseFees = {
          tuitionFee: 45000 + (Math.random() * 5000 - 2500), // 42500-47500
          semesterFee: 8000 + (Math.random() * 2000 - 1000), // 7000-9000
        };
        
        // Add optional fees randomly
        const optionalFees = {};
        if (Math.random() > 0.3) optionalFees.libraryFee = 2000 + (Math.random() * 500);
        if (Math.random() > 0.4) optionalFees.labFee = 3000 + (Math.random() * 1000);
        if (Math.random() > 0.5) optionalFees.otherFees = 5000 + (Math.random() * 1000);
        if (Math.random() > 0.8) optionalFees.hostelFee = 15000 + (Math.random() * 5000);
        
        const feeBreakdown = { ...baseFees, ...optionalFees };
        
        // Round all amounts
        Object.keys(feeBreakdown).forEach(key => {
          feeBreakdown[key] = Math.round(feeBreakdown[key]);
        });

        const totalAmount = Object.values(feeBreakdown).reduce((sum, amount) => sum + amount, 0);
        
        // Random due date (some past, some future)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (Math.random() * 120 - 60)); // ±60 days
        
        // Determine payment status
        let dueAmount = totalAmount;
        let paidAmount = 0;
        let paymentHistory = [];
        
        const paymentChance = Math.random();
        if (paymentChance > 0.7) {
          // 30% fully paid
          paidAmount = totalAmount;
          dueAmount = 0;
          
          // Add payment history entry
          paymentHistory.push({
            paymentDate: new Date(dueDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            amountPaid: totalAmount,
            paymentMode: ['UPI', 'Credit Card', 'Net Banking', 'Cash'][Math.floor(Math.random() * 4)],
            transactionId: `TXN${Date.now()}${feeCount}${semester}`,
            receiptNumber: `RCP${Date.now()}${feeCount}${semester}`,
            paymentStatus: 'Successful',
            balanceAfterPayment: 0,
            paymentGateway: 'Razorpay'
          });
        } else if (paymentChance > 0.4) {
          // 30% partially paid
          paidAmount = totalAmount * (0.2 + Math.random() * 0.6); // 20-80% paid
          dueAmount = totalAmount - paidAmount;
          
          // Add partial payment history
          paymentHistory.push({
            paymentDate: new Date(dueDate.getTime() - Math.random() * 45 * 24 * 60 * 60 * 1000),
            amountPaid: Math.round(paidAmount),
            paymentMode: ['UPI', 'Credit Card', 'Net Banking', 'Cash'][Math.floor(Math.random() * 4)],
            transactionId: `TXN${Date.now()}${feeCount}${semester}`,
            receiptNumber: `RCP${Date.now()}${feeCount}${semester}`,
            paymentStatus: 'Successful',
            balanceAfterPayment: Math.round(dueAmount),
            paymentGateway: 'Razorpay'
          });
        }
        // 40% remain pending (no payment history)

        // Create fee record
        const fee = new Fee({
          studentId: student._id,
          academicYear: academicYear,
          semester: semester.toString(),
          feeBreakdown: feeBreakdown,
          totalAmount: Math.round(totalAmount),
          paidAmount: Math.round(paidAmount),
          dueAmount: Math.round(dueAmount),
          dueDate: dueDate,
          isOverdue: dueDate < currentDate && dueAmount > 0,
          paymentHistory: paymentHistory,
          createdAt: new Date()
        });

        await fee.save();
        feeCount++;
      }
    }

    console.log(`✅ Generated ${feeCount} fee records`);
    
    // Generate summary statistics
    const totalFees = await Fee.countDocuments();
    const totalAmount = await Fee.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const collectedAmount = await Fee.aggregate([
      { $group: { _id: null, collected: { $sum: '$paidAmount' } } }
    ]);
    
    console.log('\n📈 Fee Reports Test Data Summary:');
    console.log(`Total Fee Records: ${totalFees}`);
    console.log(`Total Fee Amount: ₹${totalAmount[0]?.total.toLocaleString() || 0}`);
    console.log(`Collected Amount: ₹${collectedAmount[0]?.collected.toLocaleString() || 0}`);
    console.log(`Collection Rate: ${((collectedAmount[0]?.collected / totalAmount[0]?.total) * 100).toFixed(1)}%`);
    
    console.log('\n🎯 Enhanced Fee Reports Ready for Testing!');
    console.log('Available Reports:');
    console.log('- Collection Report: /api/fees/collection-report');
    console.log('- Department Summary: /api/fees/department-summary');
    console.log('- Fee Head Summary: /api/fees/fee-head-summary');
    console.log('- Payment History: /api/fees/payment-history-report');
    console.log('- Defaulters: /api/fees/defaulters');
    
  } catch (error) {
    console.error('❌ Error generating fee data:', error);
  } finally {
    mongoose.connection.close();
  }
}

generateFeeData();