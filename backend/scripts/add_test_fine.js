// Add test fine to a payment for demonstration
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Student = require('../models/Student');

(async function() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
  await mongoose.connect(uri);

  console.log('=== Adding Test Fine to Payment ===\n');

  // Get the first student with semester 2
  const student = await Student.findOne({ semester: '2' }).lean();
  
  if (!student) {
    console.log('No student found with semester 2');
    await mongoose.disconnect();
    return;
  }

  console.log(`Student: ${student.firstName} ${student.lastName} (ID: ${student._id})`);
  console.log(`Semester: ${student.semester}\n`);

  // Get the most recent payment for this student
  const payment = await Payment.findOne({ studentId: student._id })
    .sort({ paymentDate: -1 });

  if (!payment) {
    console.log('No payments found for this student');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found Payment: ${payment.receiptNumber}`);
  console.log(`Current Amount: ₹${payment.amount}`);
  console.log(`Current Fine: ₹${payment.fineAmount || 0}\n`);

  // Add test fine
  const testDaysDelayed = 5;
  const testFinePerDay = 50;
  const testFineAmount = testDaysDelayed * testFinePerDay;

  payment.fineAmount = testFineAmount;
  payment.daysDelayed = testDaysDelayed;
  payment.finePerDay = testFinePerDay;
  payment.totalAmountWithFine = payment.amount + testFineAmount;

  if (!payment.semester) {
    payment.semester = parseInt(student.semester);
  }

  await payment.save();

  console.log('✓ Payment updated with test fine');
  console.log(`  Receipt: ${payment.receiptNumber}`);
  console.log(`  Fine Amount: ₹${testFineAmount}`);
  console.log(`  Days Delayed: ${testDaysDelayed}`);
  console.log(`  Fine Per Day: ₹${testFinePerDay}`);
  console.log(`  Semester: ${payment.semester}`);
  console.log(`  Total with Fine: ₹${payment.totalAmountWithFine}\n`);

  console.log('Now check the student profile in the frontend to see the fine displayed!');

  await mongoose.disconnect();
})();
