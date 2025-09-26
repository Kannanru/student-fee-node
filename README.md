# Student Attendance & Fees Management (Node/Express + MongoDB)

A backend for managing students, fees, payments (Razorpay), attendance (AI/admin), timetable, and admin dashboard with real-time alerts (SSE) and exports (CSV/PDF).

## Structure
- `backend/` Express app, Mongoose models, controllers, routes
- `mgdc_home.html` Quick-launch home page
- `api_documentation_dark.html` Professional dark API docs

## Quick start
1) Dependencies (run inside backend):
```powershell
cd C:\MGC\backend
npm install
```
2) Configure environment (create `backend/.env`):
```
MONGO_URI=mongodb://localhost:27017/mgdc_fees
JWT_SECRET=change_me
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
# ATTENDANCE_REQUIRE_TIMETABLE=true
```
3) Run
```powershell
cd C:\MGC\backend
$env:PORT="5000" ; node server.js
```
4) Open
- Home: http://localhost:5000/admin/home
- Docs: http://localhost:5000/admin/docs
- Dashboard: http://localhost:5000/admin/dashboard?token=YOUR_JWT

## Notes
- Use Postman collection at `backend/docs/postman_collection.json`
- REST Client examples at `backend/requests.http`
- Exports: `/api/attendance/admin/export(.pdf)`

## License
MIT