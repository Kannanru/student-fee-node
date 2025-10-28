const axios = require('axios');

async function testStudentFeesAPI() {
  try {
    console.log('🔍 Testing Student Fees API for BDS000029 (Riya Mishra)...\n');

    // Step 1: Login as admin to get token
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@mgdc.edu.in',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Get student profile to find student ID
    console.log('2️⃣ Getting student profile for BDS000029...');
    const studentResponse = await axios.get('http://localhost:5000/api/students', {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { studentId: 'BDS000029' }
    });

    if (!studentResponse.data.data || studentResponse.data.data.length === 0) {
      console.log('❌ Student not found!');
      return;
    }

    const student = studentResponse.data.data[0];
    console.log(`✅ Student found: ${student.name}`);
    console.log(`   ID: ${student._id}`);
    console.log(`   Program: ${student.programName}, Year: ${student.currentYear}\n`);

    // Step 3: Get semester fees
    console.log('3️⃣ Getting semester 1 fees...');
    const feesResponse = await axios.get(
      `http://localhost:5000/api/students/${student._id}/semester-fees/1`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const fees = feesResponse.data.data;
    console.log(`✅ Received ${fees.length} fee heads\n`);

    // Step 4: Display fee status
    console.log('📊 FEE STATUS SUMMARY:');
    console.log('=' .repeat(80));
    
    let totalAmount = 0;
    let totalPaid = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    fees.forEach(fee => {
      totalAmount += fee.amount;
      if (fee.isPaid) {
        totalPaid += fee.amount;
        paidCount++;
        console.log(`✅ PAID   | ${fee.name.padEnd(30)} | ₹${fee.amount.toLocaleString('en-IN').padStart(10)}`);
        if (fee.billNumber) {
          console.log(`         | Bill: ${fee.billNumber}`);
        }
        if (fee.fineAmount > 0) {
          console.log(`         | Fine: ₹${fee.fineAmount} (${fee.daysDelayed} days @ ₹${fee.finePerDay}/day)`);
        }
      } else {
        unpaidCount++;
        console.log(`❌ UNPAID | ${fee.name.padEnd(30)} | ₹${fee.amount.toLocaleString('en-IN').padStart(10)}`);
      }
    });

    console.log('=' .repeat(80));
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total Fee Heads: ${fees.length}`);
    console.log(`   Paid: ${paidCount} | Unpaid: ${unpaidCount}`);
    console.log(`   Total Amount: ₹${totalAmount.toLocaleString('en-IN')}`);
    console.log(`   Paid Amount: ₹${totalPaid.toLocaleString('en-IN')}`);
    console.log(`   Pending Amount: ₹${(totalAmount - totalPaid).toLocaleString('en-IN')}`);

    if (paidCount > 0) {
      console.log('\n✅ SUCCESS! Bulk uploaded payments are now showing as PAID!');
    } else {
      console.log('\n❌ ISSUE: No fees showing as paid. Check backend logs.');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

testStudentFeesAPI();
