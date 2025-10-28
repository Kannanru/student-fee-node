/**
 * Student CRUD Test Script
 * Tests all student endpoints to verify complete functionality
 * 
 * Usage: node scripts/test_student_crud.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let createdStudentId = '';

// Test data matching new schema (23 required fields)
const testStudent = {
  studentId: 'STU' + Date.now().toString().slice(-6),
  enrollmentNumber: 'ENR2024' + Date.now().toString().slice(-6),
  firstName: 'John',
  lastName: 'Doe',
  dob: '2005-01-15',
  gender: 'Male',
  email: `test.student.${Date.now()}@example.com`,
  contactNumber: '9876543210',
  permanentAddress: '123 Test Street, Test City, Test State - 123456',
  programName: 'BDS',
  academicYear: '2024-2029',
  semester: 1,
  admissionDate: '2024-08-01',
  guardianName: 'Jane Doe',
  guardianContact: '9876543211',
  emergencyContactName: 'Emergency Contact',
  emergencyContactNumber: '9876543212',
  studentType: 'full-time',
  password: 'Test@123',
  bloodGroup: 'O+',
  status: 'active'
};

const updatedData = {
  firstName: 'John Updated',
  lastName: 'Doe Updated',
  semester: 2,
  contactNumber: '9876543219'
};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, useAuth = false) {
  const headers = {};
  if (useAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      data,
      headers
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Test functions
async function test1_AdminLogin() {
  console.log('\n📝 Test 1: Admin Login');
  console.log('─'.repeat(50));
  
  const result = await apiCall('POST', '/auth/login', {
    email: 'admin@mgdc.edu.in',
    password: 'Admin@123'
  });
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    console.log('✅ Admin login successful');
    console.log(`   Token: ${authToken.substring(0, 30)}...`);
    return true;
  } else {
    console.log('❌ Admin login failed:', result.error);
    return false;
  }
}

async function test2_CreateStudent() {
  console.log('\n📝 Test 2: Create Student');
  console.log('─'.repeat(50));
  console.log('Creating student:', {
    name: `${testStudent.firstName} ${testStudent.lastName}`,
    studentId: testStudent.studentId,
    enrollmentNumber: testStudent.enrollmentNumber,
    email: testStudent.email,
    programName: testStudent.programName,
    semester: testStudent.semester
  });
  
  const result = await apiCall('POST', '/students', testStudent, true);
  
  if (result.success && result.data.data) {
    createdStudentId = result.data.data._id;
    console.log('✅ Student created successfully');
    console.log(`   Student ID: ${createdStudentId}`);
    console.log(`   Name: ${result.data.data.firstName} ${result.data.data.lastName}`);
    console.log(`   Email: ${result.data.data.email}`);
    console.log(`   Enrollment: ${result.data.data.enrollmentNumber}`);
    console.log(`   Program: ${result.data.data.programName}`);
    console.log(`   Semester: ${result.data.data.semester}`);
    return true;
  } else {
    console.log('❌ Student creation failed:', result.error);
    console.log('   Missing fields:', result.error?.fields || 'Unknown');
    return false;
  }
}

async function test3_ListStudents() {
  console.log('\n📝 Test 3: List Students');
  console.log('─'.repeat(50));
  
  const result = await apiCall('GET', '/students?page=1&limit=5', null, true);
  
  if (result.success && result.data.data) {
    console.log('✅ Students retrieved successfully');
    console.log(`   Total: ${result.data.pagination?.totalStudents || result.data.data.length}`);
    console.log(`   Showing: ${result.data.data.length} students`);
    
    if (result.data.data.length > 0) {
      const student = result.data.data[0];
      console.log(`   First student: ${student.firstName} ${student.lastName} (${student.studentId})`);
    }
    return true;
  } else {
    console.log('❌ List students failed:', result.error);
    return false;
  }
}

async function test4_SearchStudents() {
  console.log('\n📝 Test 4: Search Students');
  console.log('─'.repeat(50));
  
  const result = await apiCall('GET', `/students?search=${testStudent.firstName}`, null, true);
  
  if (result.success && result.data.data) {
    console.log('✅ Student search successful');
    console.log(`   Found: ${result.data.data.length} students matching "${testStudent.firstName}"`);
    return true;
  } else {
    console.log('❌ Student search failed:', result.error);
    return false;
  }
}

async function test5_GetStudentById() {
  console.log('\n📝 Test 5: Get Student by ID');
  console.log('─'.repeat(50));
  
  if (!createdStudentId) {
    console.log('⚠️  Skipped: No student ID available');
    return false;
  }
  
  const result = await apiCall('GET', `/students/profile/${createdStudentId}`, null, true);
  
  if (result.success && result.data.data) {
    const student = result.data.data;
    console.log('✅ Student retrieved successfully');
    console.log(`   ID: ${student._id}`);
    console.log(`   Name: ${student.firstName} ${student.lastName}`);
    console.log(`   Student ID: ${student.studentId}`);
    console.log(`   Enrollment: ${student.enrollmentNumber}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Contact: ${student.contactNumber}`);
    console.log(`   Program: ${student.programName}`);
    console.log(`   Semester: ${student.semester}`);
    console.log(`   Guardian: ${student.guardianName} (${student.guardianContact})`);
    console.log(`   Emergency: ${student.emergencyContactName} (${student.emergencyContactNumber})`);
    console.log(`   Status: ${student.status}`);
    return true;
  } else {
    console.log('❌ Get student failed:', result.error);
    return false;
  }
}

async function test6_UpdateStudent() {
  console.log('\n📝 Test 6: Update Student');
  console.log('─'.repeat(50));
  
  if (!createdStudentId) {
    console.log('⚠️  Skipped: No student ID available');
    return false;
  }
  
  console.log('Updating fields:', updatedData);
  
  const result = await apiCall('PUT', `/students/${createdStudentId}`, updatedData, true);
  
  if (result.success && result.data.data) {
    const student = result.data.data;
    console.log('✅ Student updated successfully');
    console.log(`   New Name: ${student.firstName} ${student.lastName}`);
    console.log(`   New Semester: ${student.semester}`);
    console.log(`   New Contact: ${student.contactNumber}`);
    return true;
  } else {
    console.log('❌ Student update failed:', result.error);
    return false;
  }
}

async function test7_FilterByProgram() {
  console.log('\n📝 Test 7: Filter Students by Program');
  console.log('─'.repeat(50));
  
  const result = await apiCall('GET', '/students?programName=BDS', null, true);
  
  if (result.success && result.data.data) {
    console.log('✅ Filter by program successful');
    console.log(`   BDS Students: ${result.data.data.length}`);
    return true;
  } else {
    console.log('❌ Filter by program failed:', result.error);
    return false;
  }
}

async function test8_GetStudentFees() {
  console.log('\n📝 Test 8: Get Student Fees');
  console.log('─'.repeat(50));
  
  if (!createdStudentId) {
    console.log('⚠️  Skipped: No student ID available');
    return false;
  }
  
  const result = await apiCall('GET', `/students/${createdStudentId}/fees`, null, true);
  
  if (result.success) {
    console.log('✅ Student fees retrieved successfully');
    console.log(`   Fees data:`, result.data.data || 'No fees assigned yet');
    return true;
  } else {
    console.log('❌ Get student fees failed:', result.error);
    return false;
  }
}

async function test9_DeleteStudent() {
  console.log('\n📝 Test 9: Delete Student');
  console.log('─'.repeat(50));
  
  if (!createdStudentId) {
    console.log('⚠️  Skipped: No student ID available');
    return false;
  }
  
  const result = await apiCall('DELETE', `/students/${createdStudentId}`, null, true);
  
  if (result.success) {
    console.log('✅ Student deleted successfully');
    console.log(`   Deleted ID: ${createdStudentId}`);
    return true;
  } else {
    console.log('❌ Student deletion failed:', result.error);
    return false;
  }
}

async function test10_VerifyDeletion() {
  console.log('\n📝 Test 10: Verify Student Deletion');
  console.log('─'.repeat(50));
  
  if (!createdStudentId) {
    console.log('⚠️  Skipped: No student ID available');
    return false;
  }
  
  const result = await apiCall('GET', `/students/profile/${createdStudentId}`, null, true);
  
  if (!result.success && result.error?.message?.includes('not found')) {
    console.log('✅ Deletion verified - Student not found');
    return true;
  } else if (result.success) {
    console.log('❌ Deletion verification failed - Student still exists');
    return false;
  } else {
    console.log('❌ Verification error:', result.error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n' + '═'.repeat(50));
  console.log('🧪 STUDENT CRUD COMPLETE TEST SUITE');
  console.log('═'.repeat(50));
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('═'.repeat(50));
  
  const tests = [
    test1_AdminLogin,
    test2_CreateStudent,
    test3_ListStudents,
    test4_SearchStudents,
    test5_GetStudentById,
    test6_UpdateStudent,
    test7_FilterByProgram,
    test8_GetStudentFees,
    test9_DeleteStudent,
    test10_VerifyDeletion
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log('❌ Test error:', error.message);
      failed++;
    }
  }
  
  console.log('\n' + '═'.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(50));
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  console.log(`📈 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  console.log('═'.repeat(50));
  
  if (passed === tests.length) {
    console.log('🎉 All tests passed! Student module is fully functional.');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
  }
}

// Execute tests
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };
