// Dev helper to compute HDFC checksum for a given payload
// Usage: node .\scripts\compute_hdfc_checksum.js "{\"feeId\":\"...\",\"studentId\":\"...\",\"amount\":50000,\"status\":\"SUCCESS\"}"

const crypto = require('crypto');

const secret = process.env.HDFC_SECRET || 'DEMO_SECRET';
const arg = process.argv[2];
if (!arg) {
  console.error('Pass JSON payload as argument');
  process.exit(1);
}

let payload;
try {
  payload = JSON.parse(arg);
} catch (e) {
  console.error('Invalid JSON:', e.message);
  process.exit(1);
}

const checksum = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
console.log('Checksum:', checksum);
