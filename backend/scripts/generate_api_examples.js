// Dev-only: fetches sample responses from local server and injects into api_documentation.html
// Usage: node .\scripts\generate_api_examples.js

const fs = require('fs');
const path = require('path');
const http = require('http');

const DOC_PATH = path.resolve('c:/MGC/api_documentation.html');

function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  try {
    // 1) Student login example (use a known student or expect failure sample)
    const loginBody = JSON.stringify({ email: 'student@example.com', password: 'Password123' });
    const login = await httpRequest({ hostname: 'localhost', port: 5000, path: '/api/students/login', method: 'POST', headers: { 'Content-Type': 'application/json' } }, loginBody);

    // 2) Health check
    const health = await httpRequest({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });

    const examples = {
      generatedAt: new Date().toISOString(),
      health: JSON.parse(health.data || '{}'),
      studentLogin: (() => { try { return JSON.parse(login.data || '{}'); } catch { return { raw: login.data } } })()
    };

    const doc = fs.readFileSync(DOC_PATH, 'utf8');
    const start = '<!-- LIVE-EXAMPLES-START -->';
    const end = '<!-- LIVE-EXAMPLES-END -->';
    const before = doc.split(start)[0];
    const after = doc.split(end)[1] || '';
    const injected = `${start}\n<pre>${JSON.stringify(examples, null, 2)}</pre>\n${end}`;
    const updated = before + injected + after;
    fs.writeFileSync(DOC_PATH, updated, 'utf8');
    console.log('Live examples injected into api_documentation.html');
  } catch (err) {
    console.error('Failed to generate live examples:', err.message);
    process.exit(1);
  }
})();
