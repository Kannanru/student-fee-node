# AI Camera Attendance System - Testing Guide

## Overview
Complete guide for testing the AI camera-based attendance system with middleware, Socket.IO real-time updates, and test data simulation.

---

## System Architecture

```
AI Camera → Camera Middleware → Event Controller → Socket.IO → Frontend Dashboard
                                        ↓
                                  Database (MongoDB)
```

### Components Created:
1. **Camera Middleware** (`backend/middleware/cameraMiddleware.js`)
   - Transforms various AI camera formats (Hikvision, Dahua, Custom)
   - Generates test data for development
   - Validates camera responses

2. **Socket.IO Server** (`backend/config/socket.js`)
   - Real-time WebSocket connections
   - Emits attendance events, exceptions, session updates
   - Room-based subscriptions (attendance-stream, admin-dashboard, hall-specific)

3. **Socket Service** (`frontend/src/app/services/socket.service.ts`)
   - Angular service for Socket.IO client
   - Observable streams for real-time data
   - Connection management

4. **Real-time Dashboard** (`frontend/src/app/components/attendance/realtime-dashboard`)
   - Live attendance event display
   - Exception monitoring
   - Session statistics
   - Connection status indicator

---

## Setup & Installation

### 1. Backend Setup

```powershell
cd c:\Attendance\MGC\backend

# Dependencies already installed:
# - socket.io@4.8.1
# - cors
# - axios

# Start server (Socket.IO will auto-initialize)
npm run dev
```

**Expected Output:**
```
Server running on port 5000
MongoDB connected
🔌 Socket.IO server initialized
```

### 2. Frontend Setup

```powershell
cd c:\Attendance\MGC\frontend

# Dependencies already installed:
# - socket.io-client@4.8.1

# Start Angular dev server
ng serve
```

**Access URLs:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:5000
- Real-time Dashboard: http://localhost:4200/attendance/realtime

---

## Test Data Generation

### Method 1: Single Test Event via API

**Endpoint:** `GET http://localhost:5000/api/test-camera/generate`

**Description:** Generates ONE random test event (entry/exit pattern)

```powershell
# Using curl
curl http://localhost:5000/api/test-camera/generate
```

**Response Example:**
```json
{
  "success": true,
  "message": "Test camera event generated and processed",
  "testData": {
    "student_id": "STU001",
    "studentName": "John Doe",
    "camera_id": "CAM_HALL_01",
    "hall_id": "HALL_01",
    "direction": "IN",
    "confidence": 0.92,
    "spoof_score": 0.04,
    "timestamp": "2025-01-22T10:30:00.000Z"
  },
  "processingResult": { ... }
}
```

### Method 2: Continuous Simulation

**Endpoint:** `POST http://localhost:5000/api/test-camera/start-simulation`

**Body:**
```json
{
  "interval": 5000,  // milliseconds between events
  "count": 20        // total events to generate
}
```

**Using curl:**
```powershell
curl -X POST http://localhost:5000/api/test-camera/start-simulation `
  -H "Content-Type: application/json" `
  -d "{\"interval\": 5000, \"count\": 20}"
```

**Description:** Generates 20 test events, one every 5 seconds

### Method 3: Specific Pattern

**Endpoint:** `POST http://localhost:5000/api/test-camera/pattern`

**Body:**
```json
{
  "studentId": "STU001",
  "hallId": "HALL_01",
  "pattern": "ENTRY_EXIT"  // Options: ENTRY_ONLY, ENTRY_EXIT, EXIT_ONLY, LATE_ENTRY
}
```

**Patterns:**
- **ENTRY_ONLY**: Student enters, no exit
- **ENTRY_EXIT**: Student enters and exits after 50 minutes
- **EXIT_ONLY**: Student exits (simulates late entry missed by camera)
- **LATE_ENTRY**: Student enters 15 minutes late

---

## Test Scenarios

### Scenario 1: Normal Attendance Flow

**Objective:** Verify end-to-end attendance marking with real-time updates

**Steps:**
1. Start backend and frontend servers
2. Navigate to `http://localhost:4200/attendance/realtime`
3. Verify connection status shows "Connected" (green wifi icon)
4. Generate test event: `GET http://localhost:5000/api/test-camera/generate`
5. Observe real-time dashboard

**Expected Results:**
- ✅ Toast notification appears: "John Doe - IN - Present"
- ✅ Event appears in "Recent Attendance Events" table
- ✅ Statistics update: "Total Events" increments
- ✅ "Present" count increments
- ✅ Browser console shows: `📡 New attendance event: {...}`

### Scenario 2: Exception Handling (Low Confidence)

**Objective:** Test camera middleware rejection for low confidence

**Steps:**
1. Modify camera middleware temporarily OR generate enough events until low-confidence occurs (5% probability)
2. Observe exception in real-time dashboard

**Expected Results:**
- ⚠️ Exception appears in "Recent Exceptions" table
- ⚠️ Warning toast: "⚠️ Exception: Low Confidence"
- ⚠️ "Exceptions" stat increments
- ❌ Attendance record NOT created (only event logged as "Rejected")

### Scenario 3: Spoof Detection

**Objective:** Test spoof detection rejection

**Steps:**
1. Generate test events until spoof attempt occurs (2% probability)
2. Check exceptions section

**Expected Results:**
- ⚠️ Exception type: "SPOOF_DETECTED"
- ⚠️ Rejection reason: "Spoof Detected"
- ⚠️ Event marked as "Rejected" in database

### Scenario 4: Session Statistics Update

**Objective:** Verify real-time session stats update

**Prerequisites:**
- Create timetable entry for today
- Generate class session via `/api/sessions/generate`

**Steps:**
1. Generate session:
```json
POST /api/sessions/generate
{
  "date": "2025-01-22",
  "program": "BDS",
  "year": 1,
  "semester": 1
}
```

2. Generate test events for students in that session
3. Observe "Active Session Statistics" card

**Expected Results:**
- 📊 Session card appears with subject name
- 📊 Present count increments in real-time
- 📊 Format: "3 / 50" (3 present out of 50 expected)
- 📊 Late and absent counts update

### Scenario 5: Multiple Halls Simultaneously

**Objective:** Test concurrent events from different halls

**Steps:**
1. Create 3 halls (HALL_01, HALL_02, HALL_03)
2. Start simulation: `POST /api/test-camera/start-simulation` with interval=3000, count=30
3. Observe dashboard

**Expected Results:**
- ✅ Events from different halls appear in sequence
- ✅ Hall names displayed correctly
- ✅ No conflicts or duplicate processing
- ✅ Each event processes independently

---

## Camera Middleware Formats

The middleware supports multiple vendor formats:

### 1. Hikvision Format
```json
{
  "deviceSerial": "CAM_001",
  "faceId": "STU001",
  "similarity": 0.95,
  "captureTime": "2025-01-22T10:30:00.000Z",
  "eventType": "ENTRY",
  "livenessScore": 0.98,
  "faceUrl": "/images/face_001.jpg",
  "temperature": 36.5
}
```

**Transformed to:**
```json
{
  "student_id": "STU001",
  "camera_id": "CAM_001",
  "timestamp": "2025-01-22T10:30:00.000Z",
  "direction": "IN",
  "confidence": 0.95,
  "spoof_score": 0.02,
  "image_url": "/images/face_001.jpg",
  "temperature": 36.5
}
```

### 2. Dahua Format
```json
{
  "channelId": "CAM_002",
  "userId": "STU002",
  "matchScore": 0.91,
  "eventTime": "2025-01-22T10:35:00.000Z",
  "accessType": 1,
  "antiSpoofing": true,
  "snapUrl": "/snaps/snap_002.jpg",
  "bodyTemp": 36.8
}
```

### 3. Custom/Standard Format
```json
{
  "student_id": "STU003",
  "camera_id": "CAM_003",
  "timestamp": "2025-01-22T10:40:00.000Z",
  "direction": "OUT",
  "confidence": 0.88,
  "spoof_score": 0.05
}
```

---

## Socket.IO Event Types

### Events Emitted by Server:

1. **`attendance:new`** - New attendance event processed
```typescript
{
  type: 'EVENT_RECEIVED' | 'ATTENDANCE_MARKED',
  student: { id, name, program, year, semester },
  hall: { id, name },
  session: { id, subject, periodNumber },
  direction: 'IN' | 'OUT',
  status: 'Present' | 'Late' | 'Absent',
  timestamp: Date,
  confidence: number
}
```

2. **`dashboard:update`** - General dashboard update
```typescript
{
  type: 'attendance' | 'session',
  data: any,
  timestamp: Date
}
```

3. **`attendance:exception`** - Exception/rejected event
```typescript
{
  type: 'SPOOF_DETECTED' | 'LOW_CONFIDENCE',
  student: { id, name },
  hall: { id, name },
  confidence: number,
  spoofScore: number,
  reason: string,
  timestamp: Date
}
```

4. **`session:update`** - Session statistics update
```typescript
{
  sessionId: string,
  subject: string,
  totalPresent: number,
  totalLate: number,
  totalAbsent: number,
  totalExpected: number
}
```

5. **`camera:status`** - Camera status change
```typescript
{
  cameraId: string,
  status: 'Online' | 'Offline' | 'Maintenance',
  timestamp: Date
}
```

### Client Subscriptions:

- **`join:attendance`** - Subscribe to all attendance events
- **`join:dashboard`** - Subscribe to admin dashboard updates
- **`join:hall`** - Subscribe to specific hall events
- **`join:session`** - Subscribe to specific session updates

---

## Database Verification

### Check Created Attendance Records

```javascript
// MongoDB shell
use mgdc_fees

// View recent attendance records
db.attendances.find().sort({ createdAt: -1 }).limit(5).pretty()

// View processed events
db.attendanceevents.find({ processingStatus: 'Processed' }).sort({ timestamp: -1 }).limit(5).pretty()

// View rejected events
db.attendanceevents.find({ processingStatus: 'Rejected' }).pretty()

// Check session stats
db.classsessions.find({ date: new Date('2025-01-22') }).pretty()
```

---

## Troubleshooting

### Issue 1: "No students or halls found for test data generation"

**Solution:**
```powershell
# Seed database with test data
cd c:\Attendance\MGC\backend
npm run seed
```

### Issue 2: Socket.IO not connecting

**Symptoms:** Dashboard shows "Disconnected" status

**Solutions:**
1. Verify backend is running on port 5000
2. Check browser console for errors
3. Verify CORS settings in `backend/config/socket.js`
4. Try manual reconnect via dashboard button

### Issue 3: Events generated but not appearing in dashboard

**Check:**
1. Browser console for Socket.IO connection
2. Backend console for `📡 Emitted attendance event:` messages
3. Network tab for WebSocket connection (ws://localhost:5000)
4. Verify you're subscribed to correct rooms (`join:dashboard`, `join:attendance`)

### Issue 4: Test mode not working

**Solution:**
Set environment variable:
```powershell
# In backend/.env
CAMERA_TEST_MODE=true
```

Or send `testMode: true` in request body:
```json
POST /api/attendance/event
{
  "testMode": true,
  "student_id": "STU001",
  ...
}
```

---

## Production Deployment Notes

### ⚠️ Important: Disable Test Endpoints

Before production deployment:

1. **Remove/disable test camera routes:**
```javascript
// backend/server.js
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/test-camera', testCameraRoutes);
}
```

2. **Configure real AI camera integration:**
   - Update `cameraMiddleware.js` to handle your camera vendor's format
   - Add authentication for camera endpoints if needed
   - Configure camera IPs and access credentials

3. **Socket.IO production config:**
```javascript
// backend/config/socket.js
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Your production frontend URL
    credentials: true
  }
});
```

4. **Frontend environment:**
```typescript
// frontend/src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-domain.com',
  socketUrl: 'https://your-backend-domain.com'
};
```

---

## Performance Testing

### Load Test: Simulate 100 Concurrent Events

```powershell
# Using Apache Bench (if installed)
ab -n 100 -c 10 http://localhost:5000/api/test-camera/generate

# Or use the simulation endpoint
curl -X POST http://localhost:5000/api/test-camera/start-simulation `
  -H "Content-Type: application/json" `
  -d "{\"interval\": 100, \"count\": 100}"
```

**Expected Performance:**
- ✅ All events processed successfully
- ✅ Socket.IO broadcasts without delay
- ✅ Dashboard remains responsive
- ✅ No memory leaks
- ✅ Database writes complete within 500ms per event

---

## Quick Start Test Script

Copy and paste this into PowerShell to run a complete test:

```powershell
# Start servers (if not already running)
Start-Process powershell -ArgumentList "cd c:\Attendance\MGC\backend; npm run dev"
Start-Sleep -Seconds 5
Start-Process powershell -ArgumentList "cd c:\Attendance\MGC\frontend; ng serve"
Start-Sleep -Seconds 30

# Open real-time dashboard
Start-Process "http://localhost:4200/attendance/realtime"
Start-Sleep -Seconds 3

# Generate 10 test events, one every 3 seconds
Invoke-RestMethod -Uri "http://localhost:5000/api/test-camera/start-simulation" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"interval": 3000, "count": 10}'

Write-Host "Test started! Watch the real-time dashboard for events."
```

---

## Success Criteria

✅ **Connection Established:**
- Dashboard shows "Connected" status
- Browser console shows: `✅ Socket connected: [socket-id]`

✅ **Events Processing:**
- Test events generate successfully
- Backend console shows: `📹 Camera event received`
- Middleware transforms data correctly
- Database records created

✅ **Real-time Updates:**
- Dashboard receives events within 100ms
- Statistics update automatically
- Toast notifications appear
- Tables populate with new data

✅ **Exception Handling:**
- Low confidence events rejected
- Spoof attempts logged
- Exceptions displayed in UI

✅ **Session Tracking:**
- Session stats update in real-time
- Present/Late/Absent counts accurate
- Multiple sessions tracked independently

---

## Next Steps

After successful testing:

1. ✅ **Configure Real Cameras:** Update middleware with actual camera vendor format
2. ✅ **Security:** Add authentication to camera endpoints
3. ✅ **Monitoring:** Set up logging and error tracking
4. ✅ **Scaling:** Configure Socket.IO with Redis adapter for multiple servers
5. ✅ **Mobile App:** Extend Socket.IO for mobile notifications
6. ✅ **Parent Portal:** Real-time attendance notifications for parents

---

## Support & Documentation

- **API Docs:** `backend/docs/API_Documentation.md`
- **Camera Middleware:** `backend/middleware/cameraMiddleware.js` (lines 1-308)
- **Socket Config:** `backend/config/socket.js` (lines 1-129)
- **Frontend Service:** `frontend/src/app/services/socket.service.ts` (lines 1-224)
- **Dashboard Component:** `frontend/src/app/components/attendance/realtime-dashboard/` (all files)

---

## Test Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 4200
- [ ] MongoDB connected and seeded with data
- [ ] Real-time dashboard accessible
- [ ] Socket.IO connection shows "Connected"
- [ ] Single test event generated successfully
- [ ] Continuous simulation works (10+ events)
- [ ] Events appear in dashboard table
- [ ] Statistics update correctly
- [ ] Exceptions displayed when generated
- [ ] Session stats update (if sessions created)
- [ ] Toast notifications appear
- [ ] Database records verified
- [ ] No console errors
- [ ] Performance acceptable (< 500ms per event)

---

**Document Version:** 1.0  
**Last Updated:** January 22, 2025  
**Author:** AI Camera Attendance System Team
