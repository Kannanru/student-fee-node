# Real-time Attendance System - Complete Setup Guide

## 🎉 Sample Data Created Successfully!

Your system now has:
- ✅ **5 Halls** with cameras (A-101, B-202, C-301, D-401, E-101)
- ✅ **30 Students** (10 MBBS, 10 BDS, 10 B.Sc Nursing)
- ✅ **144 Timetable entries** (various subjects across different programs)
- ✅ **5 Active Class Sessions** running today

## 📊 Quick Start Guide

### Step 1: Ensure Backend is Running

The backend server should already be running on **port 5000**. If not, start it:

```powershell
cd c:\Attendance\MGC\backend
npm run dev
```

You should see:
```
🔌 Socket.IO server initialized
Server running on port 5000
MongoDB connected
```

### Step 2: Start Frontend Application

```powershell
cd c:\Attendance\MGC\frontend
npm start
# OR
npx ng serve --port 4200
```

**Note**: If you get execution policy errors, run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 3: Generate Real-time Attendance Events

The simulation is currently running! It's generating 50 attendance events with 2-second intervals.

#### Manual Simulation Options:

**Option A: Single Event**
```powershell
# Open browser and visit:
http://localhost:5000/api/test-camera/generate
```

**Option B: Continuous Simulation (Using Script)**
```powershell
cd c:\Attendance\MGC\backend
node scripts/start_realtime_simulation.js
```

**Option C: Custom Simulation (Using curl/Postman)**
```powershell
# Using PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/test-camera/start-simulation" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"interval": 3000, "count": 100}'
```

### Step 4: View Real-time Attendance Dashboard

Open your browser and navigate to:

**🎯 Main Dashboard (with Navigation Links)**
```
http://localhost:4200/attendance
```

**📡 Real-time Attendance Dashboard**
```
http://localhost:4200/attendance/realtime
```

## 🎬 What You'll See on Real-time Dashboard

### 1. **Connection Status**
   - Green WiFi icon = Connected to Socket.IO
   - Red WiFi icon = Disconnected (with Reconnect button)

### 2. **Live Statistics Cards**
   - **Total Events**: Count of all attendance events today
   - **Present**: Number of students marked present
   - **Late**: Number of late arrivals
   - **Exceptions**: Low confidence or spoof attempts

### 3. **Recent Events Table** (Last 20 Events)
   | Time | Student | Direction | Status | Hall | Session | Confidence |
   |------|---------|-----------|--------|------|---------|------------|
   | 10:23 AM | Rajesh Kumar | IN | Present | A-101 | Anatomy | 97% |
   | 10:24 AM | Priya Sharma | IN | Late | B-202 | Physiology | 95% |

### 4. **Exceptions Table** (Last 10 Exceptions)
   Shows any issues like:
   - Low confidence matches (< 85%)
   - Spoof attempts detected
   - Unknown faces

### 5. **Active Sessions Statistics**
   Grid showing real-time stats for each active class:
   - Session name (Subject + Room)
   - Present count
   - Attendance percentage

### 6. **Toast Notifications**
   Real-time pop-up notifications for each event:
   ```
   Rajesh Kumar - IN - Present
   ```

## 🏛️ View Hall Management

Navigate to:
```
http://localhost:4200/attendance/halls
```

You'll see all 5 configured halls with:
- Hall ID, Name, Building, Floor
- Camera status (Active/Inactive)
- Capacity
- Edit/View options

## 📅 View Timetable

Navigate to:
```
http://localhost:4200/attendance/timetable
```

Filter by:
- Program (MBBS, BDS, B.Sc Nursing)
- Year (1, 2, 3, 4)
- Section (A, B)
- Day of Week

## 📈 View Reports

Navigate to:
```
http://localhost:4200/attendance/reports
```

6 report types available:
1. **Daily Report** - Attendance by date
2. **Student Report** - Individual student summary
3. **Department Report** - Program-wise statistics
4. **Period Report** - Session-based analysis
5. **Exception Report** - Issues and anomalies
6. **Event Logs** - Complete chronological log

## 🔧 Database Verification

Check your MongoDB data:

```powershell
# Connect to MongoDB shell
mongosh

# Use the database
use mgdc_fees

# Check halls
db.halls.find().pretty()

# Check students (first 3)
db.students.find().limit(3).pretty()

# Check timetables
db.timetables.find().count()

# Check active sessions today
db.classsessions.find({status: "in_progress"}).pretty()

# Check attendance events
db.attendanceevents.find().sort({timestamp: -1}).limit(10).pretty()
```

## 🎯 Sample Students Created

| Student ID | Name | Program | Year | Section | Email |
|------------|------|---------|------|---------|-------|
| STU2025001 | Rajesh Kumar | MBBS | 1 | A | rajesh.kumar0@student.mgdc.edu |
| STU2025002 | Priya Sharma | BDS | 2 | B | priya.sharma1@student.mgdc.edu |
| STU2025003 | Amit Patel | B.Sc Nursing | 3 | A | amit.patel2@student.mgdc.edu |
| ... | ... | ... | ... | ... | ... |

**Login Credentials** (for students):
- Email: `{firstname}.{lastname}{number}@student.mgdc.edu`
- Password: `Student@123`

## 🏛️ Sample Halls Created

| Hall ID | Name | Building | Floor | Capacity | Camera |
|---------|------|----------|-------|----------|--------|
| HALL-A101 | Anatomy Lab A-101 | Block A | 1 | 60 | CAM-HALL-A101 |
| HALL-B202 | Lecture Hall B-202 | Block B | 2 | 100 | CAM-HALL-B202 |
| HALL-C301 | Biochemistry Lab C-301 | Block C | 3 | 50 | CAM-HALL-C301 |
| HALL-D401 | Physiology Lab D-401 | Block D | 4 | 80 | CAM-HALL-D401 |
| HALL-E101 | Tutorial Room E-101 | Block E | 1 | 40 | CAM-HALL-E101 |

## 📅 Sample Timetable (Today's Classes)

The system automatically created timetable entries for:
- **Morning Slot (08:00-10:00)**: Anatomy classes
- **Mid-Morning (10:15-12:15)**: Physiology classes
- **Afternoon (13:00-15:00)**: Biochemistry classes
- **Late Afternoon (15:15-17:15)**: Various subjects

All classes are mapped to appropriate halls with student lists.

## 🔍 Troubleshooting

### Backend Not Starting
```powershell
# Check if MongoDB is running
Get-Process -Name mongod

# If not running, start MongoDB
# (This depends on your MongoDB installation)
```

### Frontend Not Starting
```powershell
# Check Node.js version (should be v20.19+ or v22.12+)
node --version

# Update Node.js if needed
# Download from: https://nodejs.org/
```

### No Events Appearing
```powershell
# Check if simulation is running
Get-Process -Name node

# Restart simulation
cd c:\Attendance\MGC\backend
node scripts/start_realtime_simulation.js
```

### Socket.IO Not Connecting
1. Check browser console for errors
2. Verify backend is running on port 5000
3. Check CORS settings in backend
4. Click "Reconnect" button on dashboard

## 🚀 Advanced Usage

### Create Custom Test Event
```javascript
// POST to http://localhost:5000/api/test-camera/pattern
{
  "studentId": "STU2025001",
  "hallId": "HALL-A101",
  "pattern": "ENTRY_EXIT"  // Options: ENTRY_ONLY, ENTRY_EXIT, EXIT_ONLY, MULTIPLE_ENTRY
}
```

### Monitor Live Events via API
```powershell
# Get recent attendance events
Invoke-RestMethod -Uri "http://localhost:5000/api/attendance/events/recent?limit=20"

# Get today's statistics
Invoke-RestMethod -Uri "http://localhost:5000/api/attendance/statistics/today"
```

## 📱 Features Demonstrated

✅ **Real-time Updates**: WebSocket-based live event streaming  
✅ **Camera Simulation**: Realistic attendance event generation  
✅ **Multiple Patterns**: Entry-only, Entry-Exit, Late arrivals, Exceptions  
✅ **Multi-Hall Support**: 5 different halls with independent cameras  
✅ **Session Tracking**: Active class sessions with expected students  
✅ **Confidence Scoring**: AI-based face recognition confidence (85-99%)  
✅ **Spoof Detection**: Simulated anti-spoofing alerts (2% of events)  
✅ **Exception Handling**: Low confidence warnings (5% of events)  
✅ **Statistics Dashboard**: Live counters and percentages  
✅ **Event History**: Last 20 events with full details  
✅ **Toast Notifications**: Real-time pop-up alerts  

## 🎓 Next Steps

1. **Test the System**:
   - Open real-time dashboard
   - Watch events stream in
   - Check statistics update
   - View different reports

2. **Explore Features**:
   - Navigate through Hall Management
   - Review Timetable entries
   - Generate custom reports
   - Export data to CSV

3. **Customize**:
   - Modify student data
   - Add more halls
   - Create additional timetable entries
   - Adjust simulation patterns

## 📞 Support

If you encounter any issues:
1. Check backend logs in terminal
2. Check browser console (F12)
3. Verify all services are running
4. Review MongoDB data

---

**🎉 Congratulations!** Your real-time attendance system is now fully operational with sample data. Students are being tracked as they enter and exit halls, and all data is being captured in real-time!
