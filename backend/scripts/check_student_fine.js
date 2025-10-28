// Script to check student payment and fine details
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Payment = require('../models/Payment');
const StudentBill = require('../models/StudentBill');

(async function() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
  await mongoose.connect(uri);

  console.log('=== Checking Student Records ===\n');

  // Get sample students
  const students = await Student.find({}).limit(5).lean();
  console.log('Sample Students:');
  students.forEach((s, i) => {
    console.log(`${i+1}. ID: ${s._id}`);
    console.log(`   First Name: ${s.firstName || 'N/A'}`);
    console.log(`   Last Name: ${s.lastName || 'N/A'}`);
    console.log(`   Register Number: ${s.registerNumber || 'N/A'}`);
    console.log(`   Semester: ${s.semester || 'N/A'}`);
    console.log('');
  });

  // Search for student with registerNumber if provided
  const args = process.argv.slice(2);
  const searchTerm = args[0];
  
  if (searchTerm) {
    console.log(`\n=== Searching for: ${searchTerm} ===\n`);
    
    const student = await Student.findOne({
      $or: [
        { registerNumber: new RegExp(searchTerm, 'i') },
        { firstName: new RegExp(searchTerm, 'i') },
        { lastName: new RegExp(searchTerm, 'i') }
      ]
    }).lean();

    if (student) {
      console.log('Found Student:');
      console.log(JSON.stringify(student, null, 2));

      // Get payments for this student
      const payments = await Payment.find({ studentId: student._id })
        .select('receiptNumber amount fineAmount daysDelayed finePerDay semester status paymentDate headsPaid')
        .sort({ paymentDate: -1 })
        .lean();

      console.log(`\n=== Payments (${payments.length}) ===`);
      payments.forEach((p, i) => {
        console.log(`\n${i+1}. Receipt: ${p.receiptNumber}`);
        console.log(`   Amount: ₹${p.amount}`);
        console.log(`   Fine Amount: ₹${p.fineAmount || 0}`);
        console.log(`   Fine Per Day: ₹${p.finePerDay || 0}`);
        console.log(`   Days Delayed: ${p.daysDelayed || 0}`);
        console.log(`   Semester: ${p.semester || 'NOT SET'}`);
        console.log(`   Status: ${p.status}`);
        console.log(`   Date: ${p.paymentDate}`);
        if (p.headsPaid && p.headsPaid.length > 0) {
          console.log(`   Heads Paid: ${p.headsPaid.map(h => h.headName).join(', ')}`);
        }
      });

      // Get bills for this student
      const bills = await StudentBill.find({ studentId: student._id })
        .select('billNumber semester totalAmount paidAmount balanceAmount status')
        .sort({ semester: 1 })
        .lean();

      console.log(`\n=== Bills (${bills.length}) ===`);
      bills.forEach((b, i) => {
        console.log(`\n${i+1}. Bill: ${b.billNumber}`);
        console.log(`   Semester: ${b.semester}`);
        console.log(`   Total: ₹${b.totalAmount}`);
        console.log(`   Paid: ₹${b.paidAmount}`);
        console.log(`   Balance: ₹${b.balanceAmount}`);
        console.log(`   Status: ${b.status}`);
      });
    } else {
      console.log('Student not found!');
    }
  }

  await mongoose.disconnect();
  console.log('\nDone.');
})();
