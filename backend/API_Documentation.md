# API Documentation

This document provides a detailed explanation of the backend APIs for the MGDC Fee Management System. Each section includes the purpose of the API, the endpoint, the HTTP method, the data it expects, and the response it provides. The goal is to make it simple enough for anyone, even a 10th-grade student, to understand.

---

## List of APIs

1. **Authentication**
   - Login: `/api/auth/login` (POST)
   - Register: `/api/auth/register` (POST)
   - Get Profile: `/api/auth/profile` (GET)
   - Update Profile: `/api/auth/profile` (PUT)
2. **Fee Heads**
   - List Fee Heads: `/api/fee-heads` (GET)
   - Create Fee Head: `/api/fee-heads` (POST)
3. **Students**
   - List Students: `/api/students` (GET)
4. **Reports**
   - Collections Report: `/api/reports/collections` (GET)

---

## What is an API?

An API (Application Programming Interface) is like a waiter in a restaurant. Imagine you are at a restaurant, and you want to order food. You tell the waiter what you want, and the waiter brings it to you. Similarly, an API allows two programs to talk to each other. For example, when you log in to a website, the website talks to the server using an API to check if your username and password are correct.

---

## Authentication

### What is Authentication?
Authentication is like showing your ID card to prove who you are. In this system, you log in with your email and password to prove your identity.

### Login
- **Purpose**: To log in to the system and get complete student profile.
- **Endpoint**: `/api/auth/login`
- **Method**: POST (This means you are sending data to the server.)
- **Request**:
  ```json
  {
    "email": "student@example.com",
    "password": "password123"
  }
  ```
- **Response** (for students):
  ```json
  {
    "success": true,
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "student@example.com",
      "role": "student",
      "status": "active",
      "studentId": "STU2023001",
      "photo": "https://example.com/photos/student.jpg",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "2005-06-15",
      "gender": "male",
      "phone": "9876543210",
      "alternatePhone": "9876543211",
      "class": "10th",
      "section": "A",
      "rollNumber": "101",
      "admissionNumber": "ADM2023001",
      "admissionDate": "2023-04-15",
      "academicYear": "2023-24",
      "address": {
        "street": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "country": "India"
      },
      "guardian": {
        "fatherName": "Robert Doe",
        "motherName": "Jane Doe",
        "guardianName": "Robert Doe",
        "guardianPhone": "9876543212",
        "guardianEmail": "robert.doe@example.com",
        "guardianOccupation": "Engineer",
        "guardianAddress": "123 Main Street, Mumbai"
      },
      "bloodGroup": "O+",
      "emergencyContact": "9876543213",
      "medicalInfo": "No known allergies",
      "feeCategory": "General",
      "concessionType": "Merit",
      "concessionAmount": 1000,
      "createdAt": "2023-04-15T10:00:00Z",
      "updatedAt": "2023-09-26T10:00:00Z"
    }
  }
  ```

### Register
- **Purpose**: To create a new account.
- **Endpoint**: `/api/auth/register`
- **Method**: POST
- **Request**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "password123",
    "role": "admin"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered"
  }
  ```

### Get Profile
- **Purpose**: To get the complete profile of the logged-in user.
- **Endpoint**: `/api/auth/profile`
- **Method**: GET
- **Headers**: `Authorization: Bearer jwt_token`
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "student@example.com",
      "role": "student",
      "photo": "https://example.com/photos/student.jpg",
      // ... all other profile fields
    }
  }
  ```

### Update Profile
- **Purpose**: To update student profile information including photo.
- **Endpoint**: `/api/auth/profile`
- **Method**: PUT
- **Headers**: `Authorization: Bearer jwt_token`
- **Request**:
  ```json
  {
    "photo": "https://example.com/photos/new-photo.jpg",
    "phone": "9876543210",
    "address": {
      "street": "456 New Street",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001",
      "country": "India"
    },
    "emergencyContact": "9876543214",
    "medicalInfo": "Updated medical information"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "user": {
      // ... updated profile data
    }
  }
  ```

---

## Fee Heads

### What are Fee Heads?
Fee heads are categories for different types of fees, like tuition fees, library fees, etc.

### List Fee Heads
- **Purpose**: To see all the fee categories.
- **Endpoint**: `/api/fee-heads`
- **Method**: GET (This means you are asking the server for information.)
- **Response**:
  ```json
  [
    {
      "_id": "fee_head_id",
      "name": "Tuition Fee",
      "code": "T001",
      "taxability": false,
      "status": "active"
    }
  ]
  ```

### Create Fee Head
- **Purpose**: To add a new fee category.
- **Endpoint**: `/api/fee-heads`
- **Method**: POST
- **Request**:
  ```json
  {
    "name": "Tuition Fee",
    "code": "T001",
    "taxability": false
  }
  ```
- **Response**:
  ```json
  {
    "_id": "fee_head_id",
    "name": "Tuition Fee",
    "code": "T001",
    "taxability": false,
    "status": "active"
  }
  ```

---

## Students

### What is a Student?
A student is someone who is enrolled in a program and pays fees.

### List Students
- **Purpose**: To see all the students.
- **Endpoint**: `/api/students`
- **Method**: GET
- **Response**:
  ```json
  [
    {
      "_id": "student_id",
      "regNo": "2023001",
      "name": "John Doe",
      "program": "B.Tech",
      "semester": "5",
      "status": "active"
    }
  ]
  ```

---

## Reports

### What are Reports?
Reports give you information about fees, payments, and dues.

### Collections Report
- **Purpose**: To see how much money has been collected.
- **Endpoint**: `/api/reports/collections`
- **Method**: GET
- **Response**:
  ```json
  {
    "total": 10000,
    "payments": [
      {
        "_id": "payment_id",
        "amount": 5000,
        "status": "success"
      }
    ]
  }
  ```

---

This document is designed to be simple and easy to understand. If you have any questions, think of APIs as waiters in a restaurant—they take your order (request) and bring you what you asked for (response).