#!/usr/bin/env node
/**
 * Integration Test Script for Refactored Controllers
 * Tests: Student, Employee, and Attendance modules
 * 
 * Usage: node test_refactored_controllers.js
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let passCount = 0;
let failCount = 0;
let authToken = '';
let studentId = '';
let employeeId = '';

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function pass(test) {
  passCount++;
  log(`  ✓ ${test}`, 'green');
}

function fail(test, error) {
  failCount++;
  log(`  ✗ ${test}`, 'red');
  if (error) log(`    Error: ${error.message || error}`, 'red');
}

async function testAPI(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) config.data = data;
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Test Suites
async function testStudentModule() {
  log('\n📚 Testing Student Module', 'blue');
  log('─'.repeat(50), 'blue');
  
  // Test 1: Student Registration (Create)
  try {
    const studentData = {
      studentId: `STU${Date.now()}`,
      enrollmentNumber: `ENR${Date.now()}`,
      firstName: 'Test',
      lastName: 'Student',
      dob: '2000-01-01',
      gender: 'Male',
      email: `test${Date.now()}@example.com`,
      contactNumber: '1234567890',
      permanentAddress: '123 Test St',
      programName: 'MBBS',
      admissionDate: '2024-01-01',
      academicYear: '2024-2025',
      guardianName: 'Test Guardian',
      guardianContact: '0987654321',
      emergencyContactName: 'Emergency Contact',
      emergencyContactNumber: '1122334455',
      studentType: 'Regular',
      password: 'Test@1234'
    };
    
    const result = await testAPI('POST', '/students', studentData);
    
    if (result.success && result.data.success) {
      studentId = result.data.data._id;
      pass('Student Registration');
    } else {
      fail('Student Registration', result.error);
    }
  } catch (error) {
    fail('Student Registration', error);
  }
  
  // Test 2: Student Login
  try {
    const loginData = {
      email: `test${Date.now() - 1000}@example.com`, // Use created student email
      password: 'Test@1234'
    };
    
    const result = await testAPI('POST', '/students/login', loginData);
    
    if (result.success && result.data.data?.token) {
      authToken = result.data.data.token;
      pass('Student Login');
    } else {
      fail('Student Login (expected - student may not exist yet)');
    }
  } catch (error) {
    fail('Student Login', error);
  }
  
  // Test 3: Get All Students (List with pagination)
  try {
    const result = await testAPI('GET', '/students?page=1&limit=10');
    
    if (result.success && Array.isArray(result.data.data)) {
      pass(`Student List (${result.data.data.length} students)`);
    } else {
      fail('Student List', result.error);
    }
  } catch (error) {
    fail('Student List', error);
  }
  
  // Test 4: Get Student by ID
  if (studentId) {
    try {
      const result = await testAPI('GET', `/students/${studentId}`);
      
      if (result.success && result.data.success) {
        pass('Get Student by ID');
      } else {
        fail('Get Student by ID', result.error);
      }
    } catch (error) {
      fail('Get Student by ID', error);
    }
  }
  
  // Test 5: Update Student
  if (studentId) {
    try {
      const updateData = { contactNumber: '9999999999' };
      const result = await testAPI('PUT', `/students/${studentId}`, updateData);
      
      if (result.success && result.data.success) {
        pass('Update Student');
      } else {
        fail('Update Student', result.error);
      }
    } catch (error) {
      fail('Update Student', error);
    }
  }
}

async function testEmployeeModule() {
  log('\n👥 Testing Employee Module', 'blue');
  log('─'.repeat(50), 'blue');
  
  // Test 1: Employee Creation
  try {
    const employeeData = {
      name: 'Test Employee',
      employeeId: `EMP${Date.now()}`,
      mobile: '1234567890',
      email: `emp${Date.now()}@example.com`,
      role: 'Faculty',
      status: 'active',
      department: 'Computer Science'
    };
    
    const result = await testAPI('POST', '/employees', employeeData);
    
    if (result.success && result.status === 201) {
      employeeId = result.data._id;
      pass('Employee Creation');
    } else {
      fail('Employee Creation', result.error);
    }
  } catch (error) {
    fail('Employee Creation', error);
  }
  
  // Test 2: Get All Employees
  try {
    const result = await testAPI('GET', '/employees?page=1&limit=10');
    
    if (result.success && result.data.success) {
      pass(`Employee List (${result.data.data?.length || 0} employees)`);
    } else {
      fail('Employee List', result.error);
    }
  } catch (error) {
    fail('Employee List', error);
  }
  
  // Test 3: Get Employee by ID
  if (employeeId) {
    try {
      const result = await testAPI('GET', `/employees/${employeeId}`);
      
      if (result.success && result.data.success) {
        pass('Get Employee by ID');
      } else {
        fail('Get Employee by ID', result.error);
      }
    } catch (error) {
      fail('Get Employee by ID', error);
    }
  }
  
  // Test 4: Update Employee
  if (employeeId) {
    try {
      const updateData = { department: 'Information Technology' };
      const result = await testAPI('PUT', `/employees/${employeeId}`, updateData);
      
      if (result.success) {
        pass('Update Employee');
      } else {
        fail('Update Employee', result.error);
      }
    } catch (error) {
      fail('Update Employee', error);
    }
  }
  
  // Test 5: Search Employees
  try {
    const result = await testAPI('GET', '/employees?q=Test');
    
    if (result.success && result.data.success) {
      pass('Search Employees');
    } else {
      fail('Search Employees', result.error);
    }
  } catch (error) {
    fail('Search Employees', error);
  }
}

async function testAttendanceModule() {
  log('\n📊 Testing Attendance Module', 'blue');
  log('─'.repeat(50), 'blue');
  
  // Test 1: Record Attendance
  if (studentId) {
    try {
      const attendanceData = {
        studentId,
        className: 'CS101',
        room: 'R101',
        date: new Date().toISOString(),
        classStartTime: new Date().toISOString(),
        classEndTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'Present',
        timeIn: new Date().toISOString()
      };
      
      const result = await testAPI('POST', '/attendance/record', attendanceData);
      
      if (result.success && result.data.success) {
        pass('Record Attendance');
      } else {
        fail('Record Attendance (may fail if student not in DB)', result.error);
      }
    } catch (error) {
      fail('Record Attendance', error);
    }
  }
  
  // Test 2: Get Daily Report
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await testAPI('GET', `/attendance/admin/daily?date=${today}`);
    
    if (result.success && result.data.success) {
      pass(`Admin Daily Report (${result.data.data?.length || 0} records)`);
    } else {
      fail('Admin Daily Report', result.error);
    }
  } catch (error) {
    fail('Admin Daily Report', error);
  }
  
  // Test 3: Get Admin Summary
  try {
    const result = await testAPI('GET', '/attendance/admin/summary');
    
    if (result.success && result.data.success) {
      pass('Admin Summary');
    } else {
      fail('Admin Summary', result.error);
    }
  } catch (error) {
    fail('Admin Summary', error);
  }
  
  // Test 4: Get Student Daily Attendance
  if (studentId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await testAPI('GET', `/attendance/student/${studentId}/daily?date=${today}`);
      
      if (result.success && result.data.success) {
        pass('Student Daily Attendance');
      } else {
        fail('Student Daily Attendance', result.error);
      }
    } catch (error) {
      fail('Student Daily Attendance', error);
    }
  }
  
  // Test 5: Get Student Summary
  if (studentId) {
    try {
      const result = await testAPI('GET', `/attendance/student/${studentId}/summary`);
      
      if (result.success && result.data.success) {
        pass('Student Attendance Summary');
      } else {
        fail('Student Attendance Summary', result.error);
      }
    } catch (error) {
      fail('Student Attendance Summary', error);
    }
  }
  
  // Test 6: Get Occupancy Report
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await testAPI('GET', `/attendance/admin/occupancy?date=${today}`);
    
    if (result.success && result.data.success) {
      pass('Occupancy Report');
    } else {
      fail('Occupancy Report', result.error);
    }
  } catch (error) {
    fail('Occupancy Report', error);
  }
}

async function testHealthCheck() {
  log('\n🏥 Testing API Health', 'blue');
  log('─'.repeat(50), 'blue');
  
  try {
    const result = await testAPI('GET', '/health');
    
    if (result.success) {
      pass('API Health Check');
      return true;
    } else {
      fail('API Health Check - Server may not be running', result.error);
      return false;
    }
  } catch (error) {
    fail('API Health Check - Server may not be running', error);
    log('\n⚠️  Please ensure the backend server is running on ' + BASE_URL, 'yellow');
    return false;
  }
}

// Main execution
async function runTests() {
  log('\n╔══════════════════════════════════════════════════╗', 'blue');
  log('║   MGDC - Controller Integration Tests          ║', 'blue');
  log('║   Testing Refactored Controllers               ║', 'blue');
  log('╚══════════════════════════════════════════════════╝', 'blue');
  
  log(`\nAPI Base URL: ${BASE_URL}`, 'yellow');
  
  const isHealthy = await testHealthCheck();
  
  if (!isHealthy) {
    log('\n⛔ Server is not responding. Please start the backend server first.', 'red');
    log('   Run: cd backend && npm start', 'yellow');
    process.exit(1);
  }
  
  // Run all test suites
  await testStudentModule();
  await testEmployeeModule();
  await testAttendanceModule();
  
  // Print summary
  log('\n' + '═'.repeat(50), 'blue');
  log('TEST SUMMARY', 'blue');
  log('═'.repeat(50), 'blue');
  
  const total = passCount + failCount;
  const percentage = total > 0 ? Math.round((passCount / total) * 100) : 0;
  
  log(`\nTotal Tests: ${total}`, 'yellow');
  log(`Passed: ${passCount}`, 'green');
  log(`Failed: ${failCount}`, failCount > 0 ? 'red' : 'green');
  log(`Success Rate: ${percentage}%`, percentage >= 80 ? 'green' : 'red');
  
  if (failCount === 0) {
    log('\n🎉 All tests passed! Controllers are working correctly.', 'green');
  } else {
    log(`\n⚠️  ${failCount} test(s) failed. Please check the errors above.`, 'yellow');
  }
  
  process.exit(failCount === 0 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  log('\n❌ Fatal error during testing:', 'red');
  console.error(error);
  process.exit(1);
});
