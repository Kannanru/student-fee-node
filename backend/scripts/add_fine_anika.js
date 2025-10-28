// Find Anika Yadav student
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Payment = require('../models/Payment');

(async function() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
  await mongoose.connect(uri);

  // Search for Anika or Yadav
  const students = await Student.find({
    $or: [
      { firstName: /anika/i },
      { lastName: /yadav/i }
    ]
  }).select('_id firstName lastName semester').lean();

  if (students.length === 0) {
    console.log('No student found matching "Anika" or "Yadav"');
    console.log('\nSearching all students...');
    const allStudents = await Student.find({}).select('_id firstName lastName semester').limit(20).lean();
    allStudents.forEach((s, i) => {
      console.log(`${i+1}. ${s.firstName} ${s.lastName} - Semester: ${s.semester} - ID: ${s._id}`);
    });
  } else {
    console.log('Students matching Anika/Yadav:\n');
    students.forEach((s, i) => {
      console.log(`${i+1}. ${s.firstName} ${s.lastName} - Semester: ${s.semester} - ID: ${s._id}`);
    });

    // Add fine to the first match
    if (students.length > 0) {
      const student = students[0];
      console.log(`\n=== Adding fine to ${student.firstName} ${student.lastName} ===`);

      const payment = await Payment.findOne({ studentId: student._id }).sort({ paymentDate: -1 });

      if (!payment) {
        console.log('No payments found for this student');
      } else {
        console.log(`\nFound Payment: ${payment.receiptNumber}`);
        console.log(`Current Amount: ₹${payment.amount}`);
        console.log(`Current Fine: ₹${payment.fineAmount || 0}`);

        // Add test fine
        const testDaysDelayed = 7;
        const testFinePerDay = 100;
        const testFineAmount = testDaysDelayed * testFinePerDay;

        payment.fineAmount = testFineAmount;
        payment.daysDelayed = testDaysDelayed;
        payment.finePerDay = testFinePerDay;
        payment.totalAmountWithFine = payment.amount + testFineAmount;

        if (!payment.semester) {
          payment.semester = parseInt(student.semester) || 1;
        }

        await payment.save();

        console.log('\n✓ Payment updated with test fine');
        console.log(`  Receipt: ${payment.receiptNumber}`);
        console.log(`  Fine Amount: ₹${testFineAmount}`);
        console.log(`  Days Delayed: ${testDaysDelayed}`);
        console.log(`  Fine Per Day: ₹${testFinePerDay}`);
        console.log(`  Semester: ${payment.semester}`);
        console.log(`  Total with Fine: ₹${payment.totalAmountWithFine}`);
      }
    }
  }

  await mongoose.disconnect();
})();
