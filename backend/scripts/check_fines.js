// Check for payments with fines
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Payment = require('../models/Payment');

(async function() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
  await mongoose.connect(uri);

  const count = await Payment.countDocuments({ fineAmount: { $gt: 0 } });
  console.log(`Total payments with fine > 0: ${count}`);

  const withFine = await Payment.find({ fineAmount: { $gt: 0 } })
    .select('receiptNumber studentId amount fineAmount daysDelayed finePerDay semester status')
    .limit(10)
    .lean();

  console.log('\nPayments with fines:');
  withFine.forEach((p, i) => {
    console.log(`\n${i+1}. Receipt: ${p.receiptNumber}`);
    console.log(`   Amount: ₹${p.amount}`);
    console.log(`   Fine: ₹${p.fineAmount}`);
    console.log(`   Days Delayed: ${p.daysDelayed}`);
    console.log(`   Fine Per Day: ₹${p.finePerDay}`);
    console.log(`   Semester: ${p.semester || 'NOT SET'}`);
    console.log(`   Status: ${p.status}`);
  });

  await mongoose.disconnect();
})();
