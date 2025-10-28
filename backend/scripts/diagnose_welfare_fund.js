const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('../models/Student');
const StudentBill = require('../models/StudentBill');
const FeeHead = require('../models/FeeHead');
const FeePlan = require('../models/FeePlan');

async function diagnoseWelfareFund() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees');
    console.log('✅ Connected to MongoDB\n');

    // Find student with all fields
    const student = await Student.findOne({ studentId: 'BDS000029' });
    console.log('👤 STUDENT RECORD:');
    console.log(JSON.stringify({
      _id: student._id,
      studentId: student.studentId,
      name: student.name,
      programName: student.programName,
      year: student.year,
      currentYear: student.currentYear,
      semester: student.semester,
      quota: student.quota
    }, null, 2));

    // Try finding fee plan with different year values
    console.log('\n\n🔍 SEARCHING FOR FEE PLAN:');
    
    const yearValue = student.year || student.currentYear || 1;
    console.log(`   Using year value: ${yearValue}`);
    
    const feePlan = await FeePlan.findOne({
      program: student.programName,
      year: yearValue,
      semester: 1,
      status: 'active'
    }).populate('heads.headId');

    if (feePlan) {
      console.log(`\n✅ Fee Plan Found: ${feePlan.planName}`);
      console.log(`   Program: ${feePlan.program}, Year: ${feePlan.year}, Semester: ${feePlan.semester}`);
      console.log(`   Heads: ${feePlan.heads.length}`);
      
      // List all heads
      console.log('\n📋 FEE HEADS IN PLAN:');
      feePlan.heads.forEach((h, idx) => {
        console.log(`   ${idx + 1}. ${h.headId.name} (${h.headId.code}) - ₹${h.amount}`);
      });
    } else {
      console.log('\n❌ No fee plan found with these criteria');
      
      // Try to find ANY fee plan for BDS
      const anyPlan = await FeePlan.findOne({ program: 'BDS' }).populate('heads.headId');
      if (anyPlan) {
        console.log('\n📊 Found a BDS fee plan:');
        console.log(`   Plan: ${anyPlan.planName}`);
        console.log(`   Year: ${anyPlan.year}, Semester: ${anyPlan.semester}`);
      }
    }

    // Find Student Welfare Fund
    const welfareFund = await FeeHead.findOne({ code: 'SWF' });
    console.log(`\n\n💰 STUDENT WELFARE FUND:`);
    console.log(`   ID: ${welfareFund._id}`);
    console.log(`   Name: ${welfareFund.name}`);
    console.log(`   Code: ${welfareFund.code}`);

    // Check student bills
    const bills = await StudentBill.find({
      studentId: student._id,
      semester: 1
    }).populate('heads.headId').sort({ createdAt: -1 });

    console.log(`\n\n📄 STUDENT BILLS (${bills.length}):`);
    bills.forEach(bill => {
      console.log(`\n   Bill: ${bill.billNumber} (${bill.status})`);
      console.log(`   Total: ₹${bill.totalAmount}, Paid: ₹${bill.paidAmount}`);
      console.log(`   Heads in bill: ${bill.heads.length}`);
      
      bill.heads.forEach(h => {
        const headName = h.headId?.name || 'Unknown';
        const isWelfare = h.headId?._id?.toString() === welfareFund._id.toString();
        console.log(`      ${isWelfare ? '→' : ' '} ${headName}: ₹${h.totalAmount} (Paid: ₹${h.paidAmount}, Balance: ₹${h.balanceAmount})`);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

diagnoseWelfareFund();
