# MGDC API Test Report
Base URL: null
Date: 2025-10-16T10:41:33.896Z


## Health: GET /api/health
- Result: PASS (9 ms)
- Response: 

```json
{
  "status": "OK",
  "message": "Backend is running."
}
```

## Students: POST /api/students/login (happy path)
- Result: FAIL (187 ms)
- Error: Unexpected status 401 (expected 200)

## Students: POST /api/students/login (wrong password → 401)
- Result: PASS (15 ms)
- Request: 

```json
{
  "email": "student@example.com",
  "password": "WrongPass"
}
```
- Response: 

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

## Auth: POST /api/auth/register (happy path)
- Result: FAIL (32 ms)
- Error: Unexpected status 500 (expected 201/200)

## Auth: POST /api/auth/login (happy path)
- Result: FAIL (18 ms)
- Error: Unexpected status 500 (expected 200)

## Students: GET /api/students without token → 401
- Result: PASS (7 ms)
- Response: 

```json
{
  "message": "No token provided"
}
```

## Students: GET /api/students (happy path)
- Result: FAIL (61 ms)
- Error: Unexpected status 401 (expected 200)

## Fees: POST /api/fees/structure missing fields → 400
- Result: FAIL (22 ms)
- Error: Unexpected status 401 (expected 400)

## Fees: POST /api/fees/structure happy path
- Result: FAIL (6 ms)
- Error: Unexpected status 401 (expected 201/409)

## Fees: GET /api/fees/student/:studentId (happy path)
- Result: FAIL (20 ms)
- Error: Unexpected status 401 (expected 200/404)

## Fees: POST /api/fees/:feeId/payment amount > due → 400
- Result: PASS (0 ms)
- Skipped: No feeId available

## Fees: POST /api/fees/:feeId/payment happy path
- Result: PASS (0 ms)
- Skipped: No feeId available

## Penalty: POST /api/penalty-config missing fields → 400
- Result: FAIL (18 ms)
- Error: Unexpected status 401 (expected 400)

## Penalty: POST /api/penalty-config happy path
- Result: FAIL (6 ms)
- Error: Unexpected status 401 (expected 201/409)

## Penalty: GET /api/penalty-config
- Result: FAIL (6 ms)
- Error: Unexpected status 401 (expected 200)

## Timetable: POST /api/timetable happy path
- Result: FAIL (15 ms)
- Error: Unexpected status 401 (expected 201/200)

## Timetable: GET /api/timetable
- Result: FAIL (42 ms)
- Error: Unexpected status 401 (expected 200)

## Attendance: POST /api/attendance/record happy path
- Result: FAIL (22 ms)
- Error: Unexpected status 401 (expected 200/201)

## Attendance: GET /api/attendance/student/:id/daily
- Result: FAIL (51 ms)
- Error: Unexpected status 401 (expected 200/404)

## Attendance: GET /api/attendance/admin/occupancy
- Result: FAIL (34 ms)
- Error: Unexpected status 401 (expected 200)

## Attendance: GET /api/attendance/admin/export.pdf returns PDF
- Result: FAIL (27 ms)
- Error: Unexpected status 401 (expected 200)

## Employees: GET /api/employees unauthorized → 401
- Result: PASS (13 ms)
- Response: 

```json
{
  "message": "No token provided"
}
```

## Employees: POST /api/employees missing fields → 400
- Result: FAIL (8 ms)
- Error: Unexpected status 401 (expected 400)

## Employees: POST /api/employees happy path
- Result: FAIL (5 ms)
- Error: Unexpected status 401 (expected 201/200)

## Employees: GET /api/employees (happy path)
- Result: FAIL (22 ms)
- Error: Unexpected status 401 (expected 200)

## Razorpay: skipped (set TEST_INCLUDE_RAZORPAY=1 to enable)
- Result: PASS (0 ms)
- Skipped: default skip

## Admin: GET /admin/docs
- Result: PASS (54 ms)
- Response: 

```json
{
  "contentType": "text/html; charset=UTF-8"
}
```

## Admin: GET /admin/home
- Result: PASS (24 ms)
- Response: 

```json
{
  "contentType": "text/html; charset=UTF-8"
}
```