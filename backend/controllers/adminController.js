const jwt = require('jsonwebtoken');

function getToken(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.split(' ')[1];
  if (req.query && req.query.token) return req.query.token;
  return null;
}

exports.dashboardPage = (req, res) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).send('Unauthorized: token missing');
    try { jwt.verify(token, process.env.JWT_SECRET); } catch { return res.status(401).send('Unauthorized: invalid token'); }

    const html = `<!DOCTYPE html>
    <html><head><meta charset="utf-8"/>
    <title>Admin Attendance Dashboard</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 16px; }
      .topnav { position: sticky; top: 0; background: #111317; color:#e5e7eb; padding: 8px 10px; margin: -16px -16px 12px -16px; border-bottom: 1px solid #222; }
      .topnav a { color:#93c5fd; text-decoration:none; margin-right:12px; }
      .topnav a:hover { text-decoration: underline; }
      .cards { display: flex; gap: 12px; margin-bottom: 16px; }
      .card { border: 1px solid #ddd; padding: 12px; border-radius: 8px; min-width: 140px; }
      .Late { color: #a76400; }
      .Absent { color: #b00020; }
      .Present { color: #0a7d14; }
      .EarlyLeave { color: #555; }
      small { color: #666 }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #eee; padding: 6px 8px; text-align: left; }
      th { background: #fafafa; }
    </style>
    </head>
    <body>
      <div class="topnav">
        <a href="/admin/home">Home</a>
        <a href="/admin/docs" target="_blank">Docs</a>
      </div>
      <h2>Daily Attendance Summary</h2>
      <div>
        <label>Date: <input type="date" id="date"/></label>
        <button id="refresh">Refresh</button>
        <small id="status"></small>
      </div>
      <div class="cards">
        <div class="card Present"><div>Present</div><div id="present">0</div></div>
        <div class="card Late"><div>Late</div><div id="late">0</div></div>
        <div class="card Absent"><div>Absent</div><div id="absent">0</div></div>
        <div class="card EarlyLeave"><div>Early Leave</div><div id="early">0</div></div>
        <div class="card"><div>Attendance %</div><div id="pct">0%</div></div>
      </div>
      <h3>Occupancy by Class/Room</h3>
      <table>
        <thead><tr><th>Class</th><th>Room</th><th>Capacity</th><th>Present</th><th>Late</th><th>Absent</th><th>Early Leave</th><th>Total</th></tr></thead>
        <tbody id="occupancy"></tbody>
      </table>
      <script>
        const token = ${JSON.stringify(getToken(req))};
        const hdrs = { 'Authorization': 'Bearer ' + token };
        const dateEl = document.getElementById('date');
        const fmtDate = (d)=> d.toISOString().slice(0,10);
        const today = new Date();
        dateEl.value = fmtDate(today);
        async function refresh() {
          const date = dateEl.value;
          document.getElementById('status').textContent = 'Refreshing...';
          const s = await fetch('/api/attendance/admin/summary?startDate=' + date + '&endDate=' + date, { headers: hdrs }).then(r=>r.json());
          const o = await fetch('/api/attendance/admin/occupancy?date=' + date, { headers: hdrs }).then(r=>r.json());
          const sum = s.data && s.data.summary || { Present:0, Late:0, Absent:0, 'Early Leave':0 };
          const total = s.data && s.data.total || 0;
          document.getElementById('present').textContent = sum['Present']||0;
          document.getElementById('late').textContent = sum['Late']||0;
          document.getElementById('absent').textContent = sum['Absent']||0;
          document.getElementById('early').textContent = sum['Early Leave']||0;
          document.getElementById('pct').textContent = (s.data && s.data.percentage || 0) + '%';
          const tb = document.getElementById('occupancy');
          tb.innerHTML='';
          (o.data||[]).forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td>' + (row.className||'') + '</td>' +
                           '<td>' + (row.room||'') + '</td>' +
                           '<td>' + (row.capacity||'') + '</td>' +
                           '<td>' + (row.present||0) + '</td>' +
                           '<td>' + (row.late||0) + '</td>' +
                           '<td>' + (row.absent||0) + '</td>' +
                           '<td>' + (row.earlyLeave||0) + '</td>' +
                           '<td>' + (row.total||0) + '</td>';
            tb.appendChild(tr);
          });
          document.getElementById('status').textContent = 'Updated ' + new Date().toLocaleTimeString();
        }
        document.getElementById('refresh').addEventListener('click', refresh);
        refresh();
        // Live auto-refresh via SSE
        try {
          const es = new EventSource('/api/attendance/stream');
          es.addEventListener('attendance-alert', () => {
            // re-fetch small debounce
            clearTimeout(window.__rto);
            window.__rto = setTimeout(refresh, 500);
          });
        } catch {}
        // Periodic refresh fallback
        setInterval(()=>{ refresh(); }, 60000);
      </script>
    </body></html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (e) {
    res.status(500).send('Server error');
  }
};
