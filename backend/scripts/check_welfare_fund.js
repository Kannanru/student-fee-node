const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('../models/Student');
const StudentBill = require('../models/StudentBill');
const Payment = require('../models/Payment');
const FeeHead = require('../models/FeeHead');
const FeePlan = require('../models/FeePlan');

async function checkWelfareFund() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees');
    console.log('✅ Connected to MongoDB\n');

    // Find student
    const student = await Student.findOne({ studentId: 'BDS000029' });
    if (!student) {
      console.log('❌ Student not found');
      return;
    }
    console.log(`👤 Student: ${student.name} (${student.studentId})`);
    console.log(`   ID: ${student._id}`);
    console.log(`   Program: ${student.programName}, Year: ${student.currentYear}\n`);

    // Find Student Welfare Fund fee head
    const welfareFund = await FeeHead.findOne({ 
      $or: [
        { name: /student welfare fund/i },
        { name: /welfare fund/i }
      ]
    });

    if (!welfareFund) {
      console.log('❌ Student Welfare Fund fee head not found in database');
      return;
    }

    console.log(`📋 Fee Head: ${welfareFund.name}`);
    console.log(`   ID: ${welfareFund._id}`);
    console.log(`   Code: ${welfareFund.code}\n`);

    // Find fee plan for BDS Year 1 Semester 1
    const feePlan = await FeePlan.findOne({
      program: student.programName,
      year: student.currentYear,
      semester: 1,
      status: 'active'
    }).populate('heads.headId');

    if (!feePlan) {
      console.log('❌ No fee plan found');
      return;
    }

    console.log(`📊 Fee Plan: ${feePlan.planName}`);
    console.log(`   Total Heads: ${feePlan.heads.length}\n`);

    // Check if Student Welfare Fund is in the fee plan
    const welfareFundInPlan = feePlan.heads.find(h => 
      h.headId._id.toString() === welfareFund._id.toString()
    );

    if (welfareFundInPlan) {
      console.log(`✅ Student Welfare Fund IS in fee plan`);
      console.log(`   Amount: ₹${welfareFundInPlan.amount}`);
      console.log(`   Fine Applicable: ${welfareFundInPlan.fineApplicable ? 'Yes' : 'No'}\n`);
    } else {
      console.log(`❌ Student Welfare Fund NOT in fee plan\n`);
    }

    // Find all student bills for semester 1
    const studentBills = await StudentBill.find({
      studentId: student._id,
      semester: 1
    }).sort({ createdAt: -1 });

    console.log(`📄 Student Bills: ${studentBills.length} found`);
    studentBills.forEach(bill => {
      console.log(`\n   Bill: ${bill.billNumber}`);
      console.log(`   Status: ${bill.status}`);
      console.log(`   Created: ${bill.createdAt}`);
      console.log(`   Total: ₹${bill.totalAmount}, Paid: ₹${bill.paidAmount}, Balance: ₹${bill.balanceAmount}`);
      
      // Check if Student Welfare Fund is in this bill
      const welfareInBill = bill.heads.find(h => 
        h.headId.toString() === welfareFund._id.toString()
      );

      if (welfareInBill) {
        console.log(`\n   ✅ Student Welfare Fund in this bill:`);
        console.log(`      Total: ₹${welfareInBill.totalAmount}`);
        console.log(`      Paid: ₹${welfareInBill.paidAmount}`);
        console.log(`      Balance: ₹${welfareInBill.balanceAmount}`);
        console.log(`      Status: ${welfareInBill.paidAmount >= welfareInBill.totalAmount ? 'PAID' : 'UNPAID'}`);
      } else {
        console.log(`   ❌ Student Welfare Fund NOT in this bill`);
      }

      // List all heads in this bill
      console.log(`\n   Heads in bill (${bill.heads.length}):`);
      bill.heads.forEach(h => {
        console.log(`      - ${h.headId} | ₹${h.totalAmount} | Paid: ₹${h.paidAmount}`);
      });
    });

    // Find all payments
    const payments = await Payment.find({
      studentId: student._id
    }).sort({ createdAt: -1 });

    console.log(`\n\n💰 Payments: ${payments.length} found`);
    payments.forEach(payment => {
      console.log(`\n   Receipt: ${payment.receiptNumber}`);
      console.log(`   Amount: ₹${payment.amount}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Date: ${payment.paymentDate}`);
      
      if (payment.headsPaid && payment.headsPaid.length > 0) {
        console.log(`   Heads Paid (${payment.headsPaid.length}):`);
        payment.headsPaid.forEach(hp => {
          const isWelfare = hp.headId.toString() === welfareFund._id.toString();
          console.log(`      - ${hp.headId} | ₹${hp.amount} ${isWelfare ? '← WELFARE FUND' : ''}`);
        });
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkWelfareFund();
