# Class-Based Dashboard - Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    REAL-TIME ATTENDANCE DASHBOARD                       │
│                         (Class-Based Tracking)                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: CLASS SELECTION                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [Program ▼]    [Year ▼]    [Section ▼]    [Load Class Button]        │
│   MBBS          1-4         A/B                                        │
│   BDS                                                                  │
│   B.Sc Nursing                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: API CALLS                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  GET /api/students?programName=BDS&year=1&section=A&limit=100          │
│  ─────────────────────────────────────────────────────────────────────  │
│  Response: [                                                           │
│    { studentId: "BDS2024001", firstName: "John", lastName: "Doe",      │
│      rollNumber: "R001", programName: "BDS", year: 1, section: "A" }   │
│  ]                                                                      │
│                                                                         │
│  GET /api/timetable/current?programName=BDS&year=1&section=A           │
│  ─────────────────────────────────────────────────────────────────────  │
│  Response: {                                                           │
│    subject: "Anatomy", hallName: "Main Hall", periodNumber: 2,         │
│    startTime: "10:00", endTime: "11:00", faculty: "Dr. Smith"          │
│  }                                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: DISPLAY CURRENT SESSION (ON TOP)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ╔═══════════════════════════════════════════════════════════════════╗ │
│  ║  📚 Anatomy  │  🚪 Main Hall  │  ⏰ Period 2 (10:00-11:00)  │     ║ │
│  ║                         👨‍🏫 Faculty: Dr. Smith                        ║ │
│  ╚═══════════════════════════════════════════════════════════════════╝ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4: INITIALIZE STUDENT STATUS TABLE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┬─────────────────┬──────────────┬─────────────────┐   │
│  │ Roll Number  │ Student Name    │ Status       │ Last Updated    │   │
│  ├──────────────┼─────────────────┼──────────────┼─────────────────┤   │
│  │ R001         │ John Doe        │ ⏳ Pending   │ -               │   │
│  │ R002         │ Jane Smith      │ ⏳ Pending   │ -               │   │
│  │ R003         │ Mike Johnson    │ ⏳ Pending   │ -               │   │
│  │ R004         │ Sarah Williams  │ ⏳ Pending   │ -               │   │
│  │ ...          │ ...             │ ⏳ Pending   │ -               │   │
│  └──────────────┴─────────────────┴──────────────┴─────────────────┘   │
│                                                                         │
│  Statistics: [Total: 13] [Present: 0] [Absent: 0] [Pending: 13]        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 5: REAL-TIME EVENT ARRIVES (Socket.IO)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Event: {                                                              │
│    studentId: "BDS2024001",                                            │
│    student: { program: "BDS", year: 1, firstName: "John",             │
│               lastName: "Doe" },                                       │
│    direction: "IN",                                                    │
│    hallName: "Main Hall",                                              │
│    timestamp: "2024-01-15T10:05:00Z"                                   │
│  }                                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 6: FILTER EVENT BY CLASS                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ✅ event.student.program === "BDS" (selected)                         │
│  ✅ event.student.year === 1 (selected)                                │
│                                                                         │
│  → Event MATCHES selected class, process it                            │
│                                                                         │
│  (If program or year doesn't match, IGNORE event)                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 7: UPDATE STUDENT STATUS                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Find student: studentId = "BDS2024001" (John Doe)                     │
│  Event direction: "IN"                                                 │
│                                                                         │
│  ACTION: Update status from "Pending" → "In"                           │
│                                                                         │
│  ┌──────────────┬─────────────────┬──────────────┬─────────────────┐   │
│  │ Roll Number  │ Student Name    │ Status       │ Last Updated    │   │
│  ├──────────────┼─────────────────┼──────────────┼─────────────────┤   │
│  │ R001         │ John Doe        │ ✅ In        │ 10:05 AM        │   │
│  │ R002         │ Jane Smith      │ ⏳ Pending   │ -               │   │
│  │ R003         │ Mike Johnson    │ ⏳ Pending   │ -               │   │
│  │ R004         │ Sarah Williams  │ ⏳ Pending   │ -               │   │
│  └──────────────┴─────────────────┴──────────────┴─────────────────┘   │
│                                                                         │
│  Statistics: [Total: 13] [Present: 1] [Absent: 0] [Pending: 12]        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 8: EXIT EVENT                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Event: { studentId: "BDS2024001", direction: "OUT", ... }             │
│                                                                         │
│  ACTION: Update status from "In" → "Out"                               │
│                                                                         │
│  ┌──────────────┬─────────────────┬──────────────┬─────────────────┐   │
│  │ R001         │ John Doe        │ 🚪 Out       │ 11:05 AM        │   │
│  │ R002         │ Jane Smith      │ ⏳ Pending   │ -               │   │
│  └──────────────┴─────────────────┴──────────────┴─────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 9: AUTO-ABSENT MARKING (After 10 Minutes)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Timer runs every 1 minute                                             │
│  Session start time: 10:00 AM                                          │
│  Current time: 10:11 AM                                                │
│                                                                         │
│  ✅ More than 10 minutes passed since session start                    │
│                                                                         │
│  ACTION: Mark all "Pending" students → "Absent"                        │
│                                                                         │
│  ┌──────────────┬─────────────────┬──────────────┬─────────────────┐   │
│  │ R001         │ John Doe        │ 🚪 Out       │ 11:05 AM        │   │
│  │ R002         │ Jane Smith      │ ❌ Absent    │ 10:11 AM        │   │
│  │ R003         │ Mike Johnson    │ ❌ Absent    │ 10:11 AM        │   │
│  │ R004         │ Sarah Williams  │ ❌ Absent    │ 10:11 AM        │   │
│  └──────────────┴─────────────────┴──────────────┴─────────────────┘   │
│                                                                         │
│  Statistics: [Total: 13] [Present: 0] [Absent: 12] [Pending: 0]        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════
                           STATUS CHIP LEGEND
═══════════════════════════════════════════════════════════════════════════

  ⏳ Pending   →  Gray chip with "schedule" icon (initial state)
  ✅ In        →  Green chip with "login" icon (student entered)
  🚪 Out       →  Blue chip with "logout" icon (student exited)
  ❌ Absent    →  Red chip with "cancel" icon (auto-marked after 10 min)

═══════════════════════════════════════════════════════════════════════════
                         REAL-TIME EVENT FILTERING
═══════════════════════════════════════════════════════════════════════════

  Selected Class: BDS Year 1

  Event for BDS Year 1     →  ✅ SHOW (matches selected class)
  Event for MBBS Year 2    →  ❌ HIDE (different class)
  Event for BDS Year 2     →  ❌ HIDE (different year)
  Event for BDS Year 1     →  ✅ SHOW (matches selected class)

═══════════════════════════════════════════════════════════════════════════
                            TECHNICAL STACK
═══════════════════════════════════════════════════════════════════════════

  Frontend:
    - Angular 20.3.3 (Standalone Components)
    - Material Design (Cards, Tables, Chips, Dropdowns)
    - Socket.IO-client 4.8.1 (Real-time events)
    - RxJS (Reactive programming)

  Backend:
    - Node.js + Express
    - MongoDB + Mongoose
    - Socket.IO 4.8.1 (WebSocket server)
    - JWT Authentication

  APIs:
    - GET /api/students?programName&year&section&limit
    - GET /api/timetable/current?programName&year&section
    - WebSocket: attendance-event, admin-dashboard

═══════════════════════════════════════════════════════════════════════════
                           FILE STRUCTURE
═══════════════════════════════════════════════════════════════════════════

  frontend/src/app/components/attendance/realtime-dashboard/
    ├── realtime-dashboard.component.ts        (314 lines)
    ├── realtime-dashboard.component.html      (~200 lines)
    ├── realtime-dashboard.component.css       (~330 lines)
    ├── realtime-dashboard.component.ts.backup (original backup)
    ├── realtime-dashboard.component.html.backup
    └── realtime-dashboard.component.css.backup

  backend/
    ├── controllers/
    │   ├── studentController.js               (updated: lines 95-102)
    │   └── timetableController.js             (updated: added getCurrentSession)
    └── routes/
        └── timetable.js                       (updated: added /current route)

═══════════════════════════════════════════════════════════════════════════
                         QUICK START COMMANDS
═══════════════════════════════════════════════════════════════════════════

  # Start Backend
  cd c:\Attendance\MGC\backend
  npm start

  # Start Frontend
  cd c:\Attendance\MGC\frontend
  ng serve

  # Generate Test Event (IN)
  Invoke-RestMethod -Uri "http://localhost:5000/api/camera/test-events" \
    -Method Post -ContentType "application/json" \
    -Body '{"eventType":"ENTRY_ONLY","studentId":"BDS2024001"}'

  # Generate Test Event (OUT)
  Invoke-RestMethod -Uri "http://localhost:5000/api/camera/test-events" \
    -Method Post -ContentType "application/json" \
    -Body '{"eventType":"EXIT_ONLY","studentId":"BDS2024001"}'

═══════════════════════════════════════════════════════════════════════════
                              SUCCESS ✅
═══════════════════════════════════════════════════════════════════════════

  All requirements implemented:
    ✅ Class selection (Program, Year, Section)
    ✅ Filtered student list per class
    ✅ Status tracking (Pending → In → Out → Absent)
    ✅ Real-time updates via Socket.IO
    ✅ Current session display on top (Hall, Period, Faculty)
    ✅ Auto-absent marking after 10 minutes
    ✅ Color-coded status chips
    ✅ Responsive Material Design UI

  Ready for production use!

═══════════════════════════════════════════════════════════════════════════
```
