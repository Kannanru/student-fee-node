# ✅ REAL-TIME ATTENDANCE SYSTEM - READY TO USE

## 🎉 What Has Been Created

### ✅ Sample Data Successfully Generated:

1. **5 Halls with AI Cameras**
   - HALL-A101: Anatomy Lab A-101 (60 capacity)
   - HALL-B202: Lecture Hall B-202 (100 capacity)
   - HALL-C301: Biochemistry Lab C-301 (50 capacity)
   - HALL-D401: Physiology Lab D-401 (80 capacity)
   - HALL-E101: Tutorial Room E-101 (40 capacity)
   
   All halls have active cameras configured with Hikvision simulation.

2. **33 Students Across 3 Programs**
   - 10 MBBS students
   - 13 BDS students
   - 10 B.Sc Nursing students
   
   All students have face encoding registered and are ready for attendance tracking.

3. **144 Timetable Entries**
   - Classes scheduled across different days, times, and halls
   - Multiple subjects per program
   - Morning and afternoon time slots
   - All mapped to specific halls and students

4. **5 Active Class Sessions (Today)**
   - Sessions ready to track attendance
   - Each session has expected student list
   - Mapped to specific halls and time slots

## 🚀 HOW TO USE THE SYSTEM

### Step 1: Start the Backend Server

```powershell
cd c:\Attendance\MGC\backend
npm run dev
```

**Expected output:**
```
🔌 Socket.IO server initialized
Server running on port 5000
MongoDB connected
```

### Step 2: Start the Frontend Application

**Option A - If execution policy allows:**
```powershell
cd c:\Attendance\MGC\frontend
ng serve --port 4200
```

**Option B - If you get execution policy error:**
```powershell
cd c:\Attendance\MGC\frontend
npx ng serve --port 4200
```

**Option C - Fix execution policy permanently (Run PowerShell as Administrator):**
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Then use Option A.

### Step 3: Open the Attendance Dashboard

Open your browser and navigate to:
```
http://localhost:4200/attendance
```

You'll see the main dashboard with 4 quick link cards:
- 📡 Real-time Updates
- 🏛️ Hall Management  
- 📅 Timetable Master
- 📊 Reports & Analytics

### Step 4: Generate Real-time Attendance Events

**Method 1: Using Browser (Easiest)**

Open a new browser tab and visit:
```
http://localhost:5000/api/test-camera/generate
```

This generates a single attendance event. Refresh the page to generate more events one by one.

**Method 2: Using PowerShell (For Continuous Events)**

```powershell
cd c:\Attendance\MGC\backend

# Option A: Using JSON body
$body = '{"interval": 2000, "count": 50}'
Invoke-RestMethod -Uri 'http://localhost:5000/api/test-camera/start-simulation' -Method POST -ContentType 'application/json' -Body $body

# Option B: Generate single events in a loop
for ($i=1; $i -le 20; $i++) {
    Write-Host "Generating event $i..."
    Invoke-RestMethod -Uri 'http://localhost:5000/api/test-camera/generate' -Method GET
    Start-Sleep -Seconds 2
}
```

**Method 3: Using Postman**

- **URL**: `POST http://localhost:5000/api/test-camera/start-simulation`
- **Headers**: `Content-Type: application/json`
- **Body (JSON)**:
```json
{
  "interval": 2000,
  "count": 50
}
```

### Step 5: View Real-time Updates

Click on **"Real-time Updates"** card in the dashboard, or navigate directly to:
```
http://localhost:4200/attendance/realtime
```

You'll see:
- ✅ **Connection Status** (Green WiFi icon = Connected)
- 📊 **Live Statistics** (Total Events, Present, Late, Exceptions)
- 📋 **Recent Events Table** (Last 20 events with timestamps)
- ⚠️ **Exceptions Table** (Low confidence, spoof attempts)
- 🏫 **Active Sessions** (Real-time attendance by class)
- 🔔 **Toast Notifications** (Pop-up for each new event)

## 📊 VIEWING DIFFERENT FEATURES

### View Halls and Cameras

Navigate to: `http://localhost:4200/attendance/halls`

You'll see all 5 halls with:
- Hall ID and Name
- Building and Floor
- Capacity
- Camera Status (Active/Inactive)
- Camera IP and Type

### View Timetable

Navigate to: `http://localhost:4200/attendance/timetable`

Filter by:
- Program (MBBS, BDS, B.Sc Nursing)
- Year (1, 2, 3, 4)
- Section (A, B)
- Day of Week

You'll see all scheduled classes with:
- Class name and Subject
- Room/Hall assignment
- Time slots
- Faculty
- Expected students

### View Reports

Navigate to: `http://localhost:4200/attendance/reports`

6 report types available:
1. **Daily Report**: Attendance by date
2. **Student Report**: Individual student analysis
3. **Department Report**: Program-wise statistics
4. **Period Report**: Session-based attendance
5. **Exception Report**: Issues and anomalies
6. **Event Logs**: Complete chronological timeline

All reports support CSV export.

## 🔍 VERIFY SYSTEM STATUS

Run this command to check the system:

```powershell
cd c:\Attendance\MGC\backend
node scripts/check_system_status.js
```

You'll see:
- Number of halls and their status
- Total students by program
- Timetable entries count
- Active sessions today
- Recent attendance events
- Exception count

## 📱 WHAT TO EXPECT

### When Events Are Generated:

1. **Real-time Dashboard Updates Automatically**
   - New row appears in "Recent Events" table
   - Statistics counters increment
   - Toast notification shows: "StudentName - IN/OUT - Status"
   - Connection stays green (Socket.IO connected)

2. **Event Types You'll See:**
   - **IN** events: Student entering a hall
   - **OUT** events: Student leaving a hall
   - **Present**: On-time attendance
   - **Late**: Arrived after session start time
   - **Exception**: Low confidence or spoof attempt

3. **Realistic Simulation Patterns:**
   - 40% Entry-only (student enters, stays)
   - 40% Entry-Exit (student enters, then exits after 45-60 min)
   - 10% Exit-only (student leaving)
   - 10% Multiple entries
   - 5% Low confidence warnings (< 85%)
   - 2% Spoof detection alerts

## 🎯 SAMPLE TEST WORKFLOW

1. **Start both servers** (backend on 5000, frontend on 4200)
2. **Open dashboard**: `http://localhost:4200/attendance`
3. **Click "Real-time Updates"** card
4. **In another tab, generate events**:
   - Visit: `http://localhost:5000/api/test-camera/generate`
   - Refresh page 10 times to create 10 events
5. **Watch the real-time dashboard**:
   - Events appear instantly
   - Statistics update
   - Notifications pop up
6. **Explore other features**:
   - Check Halls to see camera configurations
   - View Timetable to see scheduled classes
   - Generate reports from collected data

## 📊 DATABASE VERIFICATION

To verify data in MongoDB:

```javascript
// Connect to MongoDB shell (if you have MongoDB Compass or mongosh)
use mgdc_fees

// Check halls
db.halls.find().pretty()

// Check students (first 5)
db.students.find().limit(5).pretty()

// Check timetables for today
const today = new Date().getDay()
db.timetables.find({dayOfWeek: today}).pretty()

// Check active sessions
db.classsessions.find({status: "in_progress"}).pretty()

// Check recent attendance events
db.attendanceevents.find().sort({timestamp: -1}).limit(10).pretty()
```

## 🛠️ TROUBLESHOOTING

### Issue: Backend won't start
**Solution**: Check if MongoDB is running
```powershell
Get-Process -Name mongod
```
If not running, start MongoDB service.

### Issue: Frontend execution policy error
**Solution**: Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Port 5000 already in use
**Solution**: Kill existing process:
```powershell
Get-Process node | Stop-Process -Force
```

### Issue: Socket.IO not connecting (Red WiFi icon)
**Solutions**:
1. Check backend is running on port 5000
2. Clear browser cache and refresh
3. Check browser console for errors (F12)
4. Click "Reconnect" button on dashboard

### Issue: No events appearing
**Solutions**:
1. Verify backend server is running
2. Check that you're generating events (visit generate URL)
3. Check browser console for Socket.IO connection
4. Verify MongoDB is running and has data

## 📞 QUICK REFERENCE COMMANDS

**Check system status:**
```powershell
cd c:\Attendance\MGC\backend
node scripts/check_system_status.js
```

**Generate single event:**
Browser: `http://localhost:5000/api/test-camera/generate`

**Start backend:**
```powershell
cd c:\Attendance\MGC\backend
npm run dev
```

**Start frontend:**
```powershell
cd c:\Attendance\MGC\frontend
npx ng serve --port 4200
```

**Reseed database (if needed):**
```powershell
cd c:\Attendance\MGC\backend
npm run seed:realtime
```

## ✅ SUCCESS CHECKLIST

- [x] MongoDB running
- [x] 5 Halls created with cameras
- [x] 33 Students created with face encoding
- [x] 144 Timetable entries created
- [x] 5 Active class sessions for today
- [x] Backend server configuration ready
- [x] Frontend dashboard with navigation links
- [x] Real-time Socket.IO dashboard component
- [x] Event generation endpoints working
- [x] System status check script ready

## 🎉 YOU'RE ALL SET!

Your real-time attendance system is fully configured and ready to use. Simply:

1. Start backend server (`npm run dev` in backend folder)
2. Start frontend (`npx ng serve` in frontend folder)  
3. Open `http://localhost:4200/attendance`
4. Click "Real-time Updates"
5. Generate events by visiting `http://localhost:5000/api/test-camera/generate`
6. Watch live attendance tracking in action!

---

**Created on:** October 22, 2025  
**System:** MGDC Medical College - AI-Based Attendance System  
**Technology:** Node.js, Express, MongoDB, Socket.IO, Angular 20, Material Design
