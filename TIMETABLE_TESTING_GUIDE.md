# 🧪 Quick Testing Guide - Timetable Format Fix

## Prerequisites
- ✅ Backend running: `cd backend && npm run dev`
- ✅ Frontend running: `cd frontend && ng serve`
- ✅ MongoDB running
- ✅ Admin user logged in

---

## Test 1: Auto-Generation Visual Feedback ✨

### Steps:
1. Navigate to: http://localhost:4200/attendance/timetable-master
2. Click **"Add New Period"** button
3. Select dropdowns:
   - **Program**: BDS
   - **Year**: 1
   - **Section**: A

### Expected Result:
✅ Blue info banner appears showing:
```
ℹ️ Auto-generated Class Name: BDS-1-A
   (Format: PROGRAM-YEAR-SECTION, e.g., BDS-1-A)
```

### Screenshot Location:
Banner should appear above the form, below the heading

---

## Test 2: Create New Period with Correct Format 📝

### Steps:
1. Fill the form (after selecting BDS-1-A above):
   - **Subject**: Dental Anatomy
   - **Day**: Wednesday
   - **Period**: 1
   - **Start Time**: 18:30
   - **End Time**: 20:00
   - **Hall**: Select any hall
   - **Faculty Name**: Dr. John Doe
   - **Department**: Dental
   - **Semester**: 1
   - **Academic Year**: 2024-2025

2. Click **"Create"** button

### Expected Result:
✅ Success message appears
✅ New entry added to table below
✅ className saved as "BDS-1-A" (not "Dental Anatomy - BDS Year 1 A")

### Verify in Database:
```powershell
mongosh mgdc_fees --eval "db.timetables.findOne({ className: 'BDS-1-A' })"
```

Should show:
```json
{
  "_id": ObjectId("..."),
  "className": "BDS-1-A",
  "programName": "BDS",
  "year": 1,
  "section": "A",
  "subject": "Dental Anatomy",
  ...
}
```

---

## Test 3: Real-time Dashboard Integration 🔄

### Steps:
1. Navigate to: http://localhost:4200/dashboard/realtime
2. Select filters:
   - **Program**: BDS
   - **Year**: 1
   - **Section**: A

### Expected Result:
✅ **Current Session** card shows:
```
📚 Current Session
Dental Anatomy
⏰ 18:30 - 20:00
📍 [Hall Name]
👨‍🏫 Dr. John Doe
```

✅ **Student list** appears below with all BDS-1-A students
✅ Each student shows status: **Pending** (or In/Out/Absent if attendance marked)

### If Session Not Showing:
- Check current day is Wednesday
- Check current time is between 18:30 and 20:00
- If not, create a period for current day/time

---

## Test 4: Edit Existing Period 📝

### Steps:
1. In Timetable Master table, click **Edit** icon on the BDS-1-A entry
2. Change **Subject** to "Oral Pathology"
3. Keep Program/Year/Section same
4. Click **"Update"**

### Expected Result:
✅ Info banner still shows "BDS-1-A" (unchanged)
✅ Subject updated in table
✅ className remains "BDS-1-A" in database

---

## Test 5: Change Class Updates className 🔄

### Steps:
1. Click **"Add New Period"** again
2. Select:
   - **Program**: MDS
   - **Year**: 2
   - **Section**: B

### Expected Result:
✅ Info banner updates immediately to:
```
ℹ️ Auto-generated Class Name: MDS-2-B
```

✅ Changes in real-time as you select different values

---

## Test 6: Section Dropdown Visible 📋

### Steps:
1. Check form first row

### Expected Result:
✅ Three dropdowns in first row:
- Program (BDS/MDS)
- Year (1/2/3/4)
- **Section (A/B/C/D)** ← NEW!

✅ Section field is required (red asterisk)
✅ Default value is "A"

---

## Test 7: Old Format Detection (Optional) 🔍

### Steps:
Run diagnostic script:
```powershell
cd backend
node scripts/debug_timetable_issue.js
```

### Expected Output:
```
✅ Database contains:
  - BDS-1-A entries: X (correct format)
  - Wrong format entries: Y (e.g., "Dental Anatomy - BDS Year 1 A")

💡 Only correct format entries appear on real-time dashboard
```

---

## Test 8: Database Cleanup (If Needed) 🧹

### Steps:
If diagnostic shows wrong format entries:
```powershell
cd backend
node scripts/cleanup_wrong_format_timetables.js
```

### Expected Output:
```
📊 Found X entries with wrong format:
1. Current className: "Dental Anatomy - BDS Year 1 A"
   → New className: "BDS-1-A"

🔄 Starting migration...
✅ Migration Complete!
   Migrated: X
   Failed: 0
```

### Verify:
Re-run diagnostic script - should show 0 wrong format entries

---

## Test 9: Filter Timetable List 🔍

### Steps:
1. In Timetable Master component
2. Use filter section at top:
   - **Program**: BDS
   - **Year**: 1
   - **Semester**: 1
   - **Academic Year**: 2024-2025
3. Click **"Apply Filters"**

### Expected Result:
✅ Table shows only BDS Year 1 Semester 1 entries
✅ All displayed entries have className format: "BDS-1-X"

---

## Test 10: Multiple Sections Same Class 📚

### Steps:
1. Create periods for:
   - BDS-1-A (Wednesday 9:00-10:00)
   - BDS-1-B (Wednesday 9:00-10:00)
   - BDS-1-C (Wednesday 9:00-10:00)

2. Navigate to Real-time Dashboard
3. Switch between sections A, B, C

### Expected Result:
✅ Each section shows its own session
✅ Different student lists for each section
✅ No data mixing between sections

---

## Common Issues & Solutions 🔧

### Issue 1: Info Banner Not Appearing
**Cause**: Form values not set
**Solution**: Ensure Program, Year, and Section all selected

### Issue 2: Real-time Dashboard Shows "No Current Session"
**Cause**: No matching timetable entry for current day/time
**Solution**: 
- Check day of week matches
- Check time is within period window
- Verify className format is correct

### Issue 3: Old Entries Still Showing Wrong Format
**Cause**: Database not cleaned
**Solution**: Run cleanup script (Test 8)

### Issue 4: Can't Save Period
**Cause**: Section field required but not filled
**Solution**: Select a section from dropdown (defaults to A)

---

## Success Criteria ✅

All tests pass if:
- ✅ Info banner shows auto-generated className
- ✅ Section dropdown visible and functional
- ✅ New periods saved with correct format (PROGRAM-YEAR-SECTION)
- ✅ Real-time dashboard displays sessions correctly
- ✅ Edit preserves className format
- ✅ Filters work correctly
- ✅ Multiple sections handled independently
- ✅ Old wrong-format entries cleaned up

---

## Next Steps After Testing

1. ✅ Verify all tests pass
2. ✅ Clean up old database entries if any
3. ✅ Create comprehensive timetable data for all classes
4. ✅ Test with real users (faculty/admin)
5. ✅ Monitor real-time dashboard performance
6. ✅ Collect feedback for improvements

---

## Quick Commands Reference

```powershell
# Start services
cd backend && npm run dev          # Backend
cd frontend && ng serve            # Frontend

# Database operations
mongosh mgdc_fees                  # Open MongoDB shell
db.timetables.find().pretty()      # View all entries
db.timetables.countDocuments()     # Count entries

# Scripts
node scripts/debug_timetable_issue.js            # Diagnostic
node scripts/cleanup_wrong_format_timetables.js  # Cleanup
node scripts/create_bds_evening_class.js         # Create test data

# Check logs
# Backend console shows API requests
# Frontend console (F12) shows errors
```

---

## Screenshot Checklist 📸

Take screenshots of:
1. ✅ Info banner with auto-generated className
2. ✅ Form with Section dropdown visible
3. ✅ Real-time dashboard showing session from new format
4. ✅ Table with correct format entries
5. ✅ Database cleanup script output

---

## Time Estimate ⏱️

- Basic tests (1-6): **10 minutes**
- Database cleanup: **5 minutes**
- Comprehensive tests (7-10): **15 minutes**
- **Total**: ~30 minutes

---

## Support

If any test fails:
1. Check browser console (F12) for errors
2. Check backend terminal for API errors
3. Verify MongoDB is running
4. Ensure you're logged in as admin
5. Review TIMETABLE_FORMAT_FIX_COMPLETE.md for details

---

Good luck with testing! 🎉
