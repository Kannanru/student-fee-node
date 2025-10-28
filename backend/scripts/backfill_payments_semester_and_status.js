#!/usr/bin/env node
/**
 * Backfill Script: Payments Semester & Status Normalization
 *
 * Goals:
 * 1) Populate Payment.semester for existing records with fineAmount > 0 (and optionally for all payments)
 *    - Primary source: StudentBill.semester via Payment.billId
 *    - Secondary source: StudentBill.semester via Payment.billNumber match (if present)
 *    - Fallback: Student.semester at time of run (best-effort)
 * 2) Normalize success status to 'confirmed' for success-like states
 *    - Map ['completed','paid','success'] => 'confirmed'
 *
 * Safe guards:
 * - Dry-run by default. Pass --commit to persist changes.
 * - Summarizes totals and prints sample diffs.
 */

// Load env from backend/.env if present
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const StudentBill = require('../models/StudentBill');
const Student = require('../models/Student');

(async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
  const commit = process.argv.includes('--commit');

  console.log(`\n=== Payments Backfill (semester/status) ===`);
  console.log(`Mongo URI: ${uri}`);
  console.log(`Mode: ${commit ? 'COMMIT (writes enabled)' : 'DRY-RUN (no writes)'}\n`);

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  const successLike = ['completed', 'paid', 'success'];

  // Load candidate payments: either missing semester OR success-like status
  const candidates = await Payment.find({
    $or: [
      { semester: { $exists: false } },
      { semester: null },
      { status: { $in: successLike } },
    ]
  }).select('_id studentId billId billNumber semester status fineAmount paymentDate');

  console.log(`Loaded ${candidates.length} candidate payments`);

  // Build bill maps for quick lookup
  const billIds = candidates.filter(p => p.billId).map(p => p.billId);
  const billsById = new Map();
  if (billIds.length) {
    const bills = await StudentBill.find({ _id: { $in: billIds } })
      .select('_id semester billNumber studentId');
    bills.forEach(b => billsById.set(String(b._id), b));
  }

  // Optional: map by billNumber if present
  const billNumbers = candidates.filter(p => p.billNumber && !p.billId).map(p => p.billNumber);
  const billsByNumber = new Map();
  if (billNumbers.length) {
    const byNum = await StudentBill.find({ billNumber: { $in: billNumbers } })
      .select('_id semester billNumber studentId');
    byNum.forEach(b => billsByNumber.set(b.billNumber, b));
  }

  let updates = 0;
  let statusNormalized = 0;
  let semesterSet = 0;

  for (const p of candidates) {
    let changed = false;
    const update = {};

    // Normalize status
    if (successLike.includes(p.status)) {
      update.status = 'confirmed';
      changed = true;
      statusNormalized++;
    }

    // Determine semester if missing
    if (!p.semester) {
      let sem = null;
      if (p.billId && billsById.get(String(p.billId))) {
        sem = billsById.get(String(p.billId)).semester;
      } else if (p.billNumber && billsByNumber.get(p.billNumber)) {
        sem = billsByNumber.get(p.billNumber).semester;
      } else if (p.studentId) {
        // Fallback: use student's current semester (best-effort)
        const s = await Student.findById(p.studentId).select('semester');
        sem = s?.semester || null;
      }
      if (sem) {
        update.semester = sem;
        changed = true;
        semesterSet++;
      }
    }

    if (changed) {
      updates++;
      if (commit) {
        await Payment.updateOne({ _id: p._id }, { $set: update });
      } else {
        console.log(`DRY-RUN update ${p._id}:`, update);
      }
    }
  }

  console.log(`\nBackfill summary:`);
  console.log(` - Candidates: ${candidates.length}`);
  console.log(` - Semester set: ${semesterSet}`);
  console.log(` - Status normalized: ${statusNormalized}`);
  console.log(` - Updates: ${updates}`);

  await mongoose.disconnect();
  console.log(`\nDone. ${commit ? 'Changes committed.' : 'No changes written (dry-run). Use --commit to write.'}`);
})();
