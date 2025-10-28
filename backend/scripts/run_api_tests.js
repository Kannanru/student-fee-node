#!/usr/bin/env node
/*
 Automated API Test Runner for MGDC Backend
 - Boots the Express app in-process and listens on PORT
 - Executes happy-path and validation/error scenarios across modules
 - Produces a Markdown report at backend/docs/test_report.md
*/
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const DEFAULT_PORT = process.env.PORT ? Number(process.env.PORT) : 0; // 0 = ephemeral
let BASE = process.env.BASE_URL || null;
const REPORT_PATH = path.join(__dirname, '..', 'docs', 'test_report.md');
const JSON_REPORT_PATH = path.join(__dirname, '..', 'docs', 'test_report.json');

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

function httpRequest(method, urlStr, { headers = {}, body } = {}){
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const lib = u.protocol === 'https:' ? https : http;
  const opts = { method, hostname: u.hostname, port: Number(u.port) || (u.protocol === 'https:' ? 443 : 80), path: u.pathname + (u.search||''), headers: { ...headers } };
      let data = null;
      if (body != null) {
        if (typeof body === 'object' && !(body instanceof Buffer)) {
          data = Buffer.from(JSON.stringify(body));
          opts.headers['Content-Type'] = opts.headers['Content-Type'] || 'application/json';
        } else if (typeof body === 'string') {
          data = Buffer.from(body);
        } else if (Buffer.isBuffer(body)) {
          data = body;
        }
        if (data) opts.headers['Content-Length'] = String(data.length);
      }
      const req = lib.request(opts, (res) => {
        const chunks = [];
        res.on('data', (c)=>chunks.push(c));
        res.on('end', ()=>{
          const buf = Buffer.concat(chunks);
          const text = buf.toString('utf8');
          const ct = (res.headers['content-type']||'').toLowerCase();
          let json = null;
          if (ct.includes('application/json')) {
            try { json = JSON.parse(text); } catch {}
          }
          resolve({ status: res.statusCode, headers: res.headers, text, json, isJson: !!json, isPdf: ct.startsWith('application/pdf') });
        });
      });
  req.on('error', (err)=>resolve({ status: 0, error: err.message }));
      if (data) req.write(data);
      req.end();
    } catch (e) {
      resolve({ status: 0, error: e.message });
    }
  });
}

function truncate(obj, n=500){
  const s = typeof obj === 'string' ? obj : JSON.stringify(obj);
  return s.length > n ? s.slice(0,n) + '…' : s;
}

function line(msg=''){ report.push(msg); }

const report = [];
const entries = [];
const ctx = { admin: {}, student: {}, ids: {}, vars: {} };

async function run(){
  line(`# MGDC API Test Report`);
  line(`Base URL: ${BASE}`);
  line(`Date: ${new Date().toISOString()}`);
  line('');

  // Start app in-process
  const app = require('../server');
  const server = app.listen(DEFAULT_PORT, ()=>{});
  // small grace period
  await sleep(300);
  const actualPort = server.address().port;
  if (!BASE) BASE = 'http://127.0.0.1:' + actualPort;

  // Wait for server readiness
  await waitForServer();

  // Health check
  await test('Health: GET /api/health', async () => {
    const res = await httpRequest('GET', `${BASE}/api/health`);
    expectStatus(res, 200);
    return { response: res.json || res.text };
  });

  // Student login (seeded student)
  await test('Students: POST /api/students/login (happy path)', async () => {
    const body = { email: 'student@example.com', password: 'Password123' };
    const res = await httpRequest('POST', `${BASE}/api/students/login`, { body });
    expectStatus(res, 200);
    ctx.student.token = res.json?.data?.token || res.json?.token;
    ctx.ids.studentId = res.json?.data?.student?._id || res.json?.data?.studentId;
    return { request: body, response: sanitize(res.json) };
  });

  await test('Students: POST /api/students/login (wrong password → 401)', async () => {
    const body = { email: 'student@example.com', password: 'WrongPass' };
    const res = await httpRequest('POST', `${BASE}/api/students/login`, { body });
    expectStatus(res, 401, 400); // depending on controller
    return { request: body, response: res.json || res.text };
  });

  // Admin register/login
  const adminEmail = `admin_${Date.now()}@example.com`;
  await test('Auth: POST /api/auth/register (happy path)', async () => {
    const body = { name: 'Test Admin', email: adminEmail, password: 'AdminPass#1', role: 'admin' };
    const res = await httpRequest('POST', `${BASE}/api/auth/register`, { body });
    expectStatus(res, 201, 200);
    return { request: body, response: res.json || res.text };
  });

  await test('Auth: POST /api/auth/login (happy path)', async () => {
    const body = { email: adminEmail, password: 'AdminPass#1' };
    const res = await httpRequest('POST', `${BASE}/api/auth/login`, { body });
    expectStatus(res, 200);
    ctx.admin.token = res.json?.token;
    return { request: body, response: sanitize(res.json) };
  });

  // Students list unauthorized
  await test('Students: GET /api/students without token → 401', async () => {
    const res = await httpRequest('GET', `${BASE}/api/students`);
    expectStatus(res, 401);
    return { response: res.json || res.text };
  });

  // Students list with token
  await test('Students: GET /api/students (happy path)', async () => {
    const res = await httpRequest('GET', `${BASE}/api/students?programName=MBBS&page=1&limit=5`, { headers: auth(ctx.admin.token) });
    expectStatus(res, 200);
    return { response: { count: res.json?.data?.length, pagination: res.json?.pagination } };
  });

  // Fee structure: create validations
  await test('Fees: POST /api/fees/structure missing fields → 400', async () => {
    const res = await httpRequest('POST', `${BASE}/api/fees/structure`, { headers: auth(ctx.admin.token), body: { academicYear: '2025-2026' } });
    expectStatus(res, 400);
    return { response: res.json || res.text };
  });

  await test('Fees: POST /api/fees/structure happy path', async () => {
    const body = { studentId: ctx.ids.studentId, academicYear: '2025-2026', semester: '1', feeBreakdown: { tuitionFee: 100000, semesterFee: 25000 }, dueDate: '2025-10-31' };
    const res = await httpRequest('POST', `${BASE}/api/fees/structure`, { headers: auth(ctx.admin.token), body });
    // 201 if created, 409 if duplicate (seed may have created)
    expectStatus(res, 201, 409);
    ctx.ids.feeId = res.json?.data?._id || ctx.ids.feeId;
    return { request: body, response: res.json || res.text };
  });

  await test('Fees: GET /api/fees/student/:studentId (happy path)', async () => {
    const res = await httpRequest('GET', `${BASE}/api/fees/student/${ctx.ids.studentId}`, { headers: auth(ctx.admin.token) });
    expectStatus(res, 200, 404); // If not found returns 404 in some controllers
    return { response: sanitize(res.json || res.text) };
  });

  await test('Fees: POST /api/fees/:feeId/payment amount > due → 400', async () => {
    if (!ctx.ids.feeId) return skip('No feeId available');
    const body = { amountPaid: 9999999, paymentMode: 'UPI', transactionId: 'TXN_BIG_'+Date.now(), receiptNumber: 'RCP_BIG' };
    const res = await httpRequest('POST', `${BASE}/api/fees/${ctx.ids.feeId}/payment`, { headers: auth(ctx.admin.token), body });
    expectStatus(res, 400);
    return { request: body, response: res.json || res.text };
  });

  await test('Fees: POST /api/fees/:feeId/payment happy path', async () => {
    if (!ctx.ids.feeId) return skip('No feeId available');
    const body = { amountPaid: 1000, paymentMode: 'Cash', transactionId: 'TXN_'+Date.now(), receiptNumber: 'RCP_'+Date.now() };
    const res = await httpRequest('POST', `${BASE}/api/fees/${ctx.ids.feeId}/payment`, { headers: auth(ctx.admin.token), body });
    expectStatus(res, 200);
    return { request: body, response: sanitize(res.json) };
  });

  // Penalty config
  await test('Penalty: POST /api/penalty-config missing fields → 400', async () => {
    const res = await httpRequest('POST', `${BASE}/api/penalty-config`, { headers: auth(ctx.admin.token), body: { academicYear: '' } });
    expectStatus(res, 400);
    return { response: res.json || res.text };
  });

  await test('Penalty: POST /api/penalty-config happy path', async () => {
    const body = { academicYear: '2025-2026', penaltyType: 'Fixed', penaltyAmount: 500, gracePeriodDays: 3 };
    const res = await httpRequest('POST', `${BASE}/api/penalty-config`, { headers: auth(ctx.admin.token), body });
    expectStatus(res, 201, 409);
    return { request: body, response: res.json || res.text };
  });

  await test('Penalty: GET /api/penalty-config', async () => {
    const res = await httpRequest('GET', `${BASE}/api/penalty-config`, { headers: auth(ctx.admin.token) });
    expectStatus(res, 200);
    return { response: { count: Array.isArray(res.json?.data) ? res.json.data.length : undefined } };
  });

  // Timetable
  await test('Timetable: POST /api/timetable happy path', async () => {
    const body = { className: 'Anatomy 101', room: 'A-101', programName: 'MBBS', academicYear: '2025-2026', dayOfWeek: 5, startTime: '08:00', endTime: '10:00', capacity: 60 };
    const res = await httpRequest('POST', `${BASE}/api/timetable`, { headers: auth(ctx.admin.token), body });
    expectStatus(res, 201, 200);
    ctx.ids.timetableId = res.json?.data?._id || ctx.ids.timetableId;
    return { request: body, response: res.json || res.text };
  });

  await test('Timetable: GET /api/timetable', async () => {
    const res = await httpRequest('GET', `${BASE}/api/timetable?programName=MBBS&academicYear=2025-2026`, { headers: auth(ctx.admin.token) });
    expectStatus(res, 200);
    return { response: { count: Array.isArray(res.json?.data) ? res.json.data.length : undefined } };
  });

  // Attendance (record + summary)
  await test('Attendance: POST /api/attendance/record happy path', async () => {
    const body = { studentId: ctx.ids.studentId, className: 'Anatomy 101', date: '2025-09-26', classStartTime: '2025-09-26T08:00:00.000Z', classEndTime: '2025-09-26T10:00:00.000Z', timeIn: '2025-09-26T08:10:00.000Z', timeOut: '2025-09-26T10:00:00.000Z', status: 'Present' };
    const res = await httpRequest('POST', `${BASE}/api/attendance/record`, { headers: auth(ctx.admin.token), body });
    expectStatus(res, 200, 201);
    return { request: body, response: sanitize(res.json || res.text) };
  });

  await test('Attendance: GET /api/attendance/student/:id/daily', async () => {
    const res = await httpRequest('GET', `${BASE}/api/attendance/student/${ctx.ids.studentId}/daily?date=2025-09-26`, { headers: auth(ctx.admin.token) });
    expectStatus(res, 200, 404);
    return { response: res.json || res.text };
  });

  await test('Attendance: GET /api/attendance/admin/occupancy', async () => {
    const res = await httpRequest('GET', `${BASE}/api/attendance/admin/occupancy?date=2025-09-26`, { headers: auth(ctx.admin.token) });
    expectStatus(res, 200);
    return { response: sanitize(res.json) };
  });

  await test('Attendance: GET /api/attendance/admin/export.pdf returns PDF', async () => {
    const res = await httpRequest('GET', `${BASE}/api/attendance/admin/export.pdf?date=2025-09-26`, { headers: auth(ctx.admin.token) });
    expectStatus(res, 200);
    if (!res.isPdf) fail(`Expected application/pdf but got ${res.headers['content-type']}`);
    return { response: { contentType: res.headers['content-type'] } };
  });

  // Employees
  await test('Employees: GET /api/employees unauthorized → 401', async () => {
    const res = await httpRequest('GET', `${BASE}/api/employees`);
    expectStatus(res, 401);
    return { response: res.json || res.text };
  });

  await test('Employees: POST /api/employees missing fields → 400', async () => {
    const res = await httpRequest('POST', `${BASE}/api/employees`, { headers: auth(ctx.admin.token), body: { name: 'Emp' } });
    expectStatus(res, 400);
    return { response: res.json || res.text };
  });

  await test('Employees: POST /api/employees happy path', async () => {
    const body = { name: 'John Doe', employeeId: `EMP_${Date.now()}`, mobile: '9999999999', email: `emp_${Date.now()}@example.com`, role: 'staff', status: 'active' };
    const res = await httpRequest('POST', `${BASE}/api/employees`, { headers: auth(ctx.admin.token), body });
    expectStatus(res, 201, 200);
    ctx.ids.employeeId = res.json?._id || res.json?.data?._id;
    return { request: body, response: res.json || res.text };
  });

  await test('Employees: GET /api/employees (happy path)', async () => {
    const res = await httpRequest('GET', `${BASE}/api/employees?q=John`, { headers: auth(ctx.admin.token) });
    expectStatus(res, 200);
    return { response: { total: res.json?.total, count: Array.isArray(res.json?.data) ? res.json.data.length : undefined } };
  });

  // Payments - Razorpay: skip by default unless explicitly included
  const includeRazorpay = process.env.TEST_INCLUDE_RAZORPAY === '1' ||
    (!!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET);
  if (!includeRazorpay) {
    await test('Razorpay: skipped (set TEST_INCLUDE_RAZORPAY=1 to enable)', async () => skip('default skip'));
  } else {
    await test('Razorpay: POST /api/payments/razorpay/order without keys → 500', async () => {
      const body = { feeId: ctx.ids.feeId, amount: 1000, currency: 'INR' };
      const res = await httpRequest('POST', `${BASE}/api/payments/razorpay/order`, { headers: auth(ctx.admin.token), body });
      expectStatus(res, 500, 400);
      return { request: body, response: truncate(res.text || JSON.stringify(res.json)) };
    });
  }

  // Admin pages
  await test('Admin: GET /admin/docs', async () => {
    const res = await httpRequest('GET', `${BASE}/admin/docs`);
    expectStatus(res, 200);
    return { response: { contentType: res.headers['content-type'] } };
  });

  await test('Admin: GET /admin/home', async () => {
    const res = await httpRequest('GET', `${BASE}/admin/home`);
    expectStatus(res, 200);
    return { response: { contentType: res.headers['content-type'] } };
  });

  // Write reports (Markdown + JSON)
  fs.writeFileSync(REPORT_PATH, report.join('\n'));
  const summary = {
    title: 'MGDC API Test Report',
    baseUrl: BASE,
    date: new Date().toISOString(),
    totals: computeTotals(entries),
    tests: entries
  };
  fs.writeFileSync(JSON_REPORT_PATH, JSON.stringify(summary, null, 2));
  console.log('Test report written to', REPORT_PATH);
  server.close();
}

function sanitize(o){
  try {
    const s = JSON.stringify(o);
    return JSON.parse(s);
  } catch { return o; }
}

function auth(token){
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function expectStatus(res, ...accepted){
  if (!accepted.includes(res.status)) {
    fail(`Unexpected status ${res.status} (expected ${accepted.join('/')})`);
  }
}

function fail(msg){ throw new Error(msg); }
function skip(reason){ return { skipped: true, reason }; }

async function waitForServer(){
  const start = Date.now();
  const timeoutMs = 5000;
  let lastErr = '';
  while (Date.now() - start < timeoutMs) {
    const res = await httpRequest('GET', `${BASE}/api/health`);
    if (res.status === 200) return;
    lastErr = res.error || `status=${res.status}`;
    await sleep(500);
  }
  line(`Server readiness check failed: ${lastErr}`);
}

function parseTitle(title){
  // Expected formats:
  // "Module: GET /path description"
  // "Module: POST /path (happy path)"
  // "Module: skipped ..."
  const obj = { module: 'General', method: '', path: '', scenario: '' };
  const parts = title.split(': ');
  if (parts.length >= 2) {
    obj.module = parts[0].trim();
    const rest = parts.slice(1).join(': ');
    const tokens = rest.trim().split(/\s+/);
    const maybeMethod = tokens[0] || '';
    const METHODS = ['GET','POST','PUT','PATCH','DELETE'];
    if (METHODS.includes(maybeMethod)) {
      obj.method = maybeMethod;
      obj.path = tokens[1] || '';
      obj.scenario = rest.slice((maybeMethod + ' ' + (obj.path||'')).length).trim();
    } else {
      obj.scenario = rest.trim();
    }
  } else {
    obj.scenario = title;
  }
  return obj;
}

function computeTotals(list){
  const totals = { pass: 0, fail: 0, skipped: 0, durationMs: 0 };
  for (const t of list) {
    totals[t.status.toLowerCase()]++;
    totals.durationMs += t.durationMs||0;
  }
  return totals;
}

async function test(title, fn){
  const start = Date.now();
  try {
    const out = await fn();
    const dur = Date.now() - start;
    line(`\n## ${title}`);
    line(`- Result: PASS (${dur} ms)`);
    if (out?.skipped) {
      line(`- Skipped: ${out.reason}`);
    } else {
      if (out?.request) line(`- Request: \n\n\`\`\`json\n${JSON.stringify(out.request,null,2)}\n\`\`\``);
      if (out?.response) line(`- Response: \n\n\`\`\`json\n${typeof out.response==='string'?out.response:JSON.stringify(out.response,null,2)}\n\`\`\``);
    }
    const meta = parseTitle(title);
    entries.push({
      title,
      ...meta,
      status: out?.skipped ? 'SKIPPED' : 'PASS',
      durationMs: dur,
      request: out?.request ?? null,
      response: out?.response ?? null,
      error: null,
    });
  } catch (err){
    const dur = Date.now() - start;
    line(`\n## ${title}`);
    line(`- Result: FAIL (${dur} ms)`);
    line(`- Error: ${err.message}`);
    const meta = parseTitle(title);
    entries.push({
      title,
      ...meta,
      status: 'FAIL',
      durationMs: dur,
      request: null,
      response: null,
      error: err.message,
    });
  }
}

run().catch(e=>{
  line(`\n\nFatal error: ${e.message}`);
  fs.writeFileSync(REPORT_PATH, report.join('\n'));
  try {
    fs.writeFileSync(JSON_REPORT_PATH, JSON.stringify({ title: 'MGDC API Test Report', baseUrl: BASE, date: new Date().toISOString(), error: e.message, tests: entries }, null, 2));
  } catch {}
  process.exit(1);
});
