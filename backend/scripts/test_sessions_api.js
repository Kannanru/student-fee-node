// Test the sessions API that the enhanced attendance reports use
const axios = require('axios');

async function testSessionsAPI() {
  try {
    console.log('🔐 Logging in...');
    
    // Login first
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@admin.com',
      password: 'admin123'
    });

    console.log('✅ Login successful!');
    const token = loginResponse.data.token;
    
    // Test sessions API for October 24, 2025
    console.log('\n📅 Testing sessions API for October 24, 2025...');
    const sessionsResponse = await axios.get(
      'http://localhost:5000/api/sessions?date=2025-10-24',
      { 
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Sessions API Response Status:', sessionsResponse.status);
    console.log('✅ Sessions Count:', sessionsResponse.data.data?.length || 0);
    
    if (sessionsResponse.data.data && sessionsResponse.data.data.length > 0) {
      const firstSession = sessionsResponse.data.data[0];
      console.log('\n📋 Sample Session:');
      console.log(`   Subject: ${firstSession.subject}`);
      console.log(`   Time: ${firstSession.startTime} - ${firstSession.endTime}`);
      console.log(`   Total Expected: ${firstSession.totalExpected}`);
      console.log(`   Total Present: ${firstSession.totalPresent}`);
      console.log(`   Total Late: ${firstSession.totalLate}`);
      console.log(`   Total Absent: ${firstSession.totalAbsent}`);

      // Test session attendance endpoint
      console.log(`\n🔍 Testing session attendance for session: ${firstSession._id}`);
      
      const sessionAttendanceResponse = await axios.get(
        `http://localhost:5000/api/sessions/${firstSession._id}/attendance`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('✅ Session Attendance API Response Status:', sessionAttendanceResponse.status);
      console.log('✅ Attendance Records Count:', sessionAttendanceResponse.data.attendanceRecords?.length || 0);
      
      if (sessionAttendanceResponse.data.attendanceRecords?.length > 0) {
        const sampleRecord = sessionAttendanceResponse.data.attendanceRecords[0];
        console.log('\n👤 Sample Attendance Record:');
        console.log(`   Student: ${sampleRecord.studentRef?.studentName || 'N/A'}`);
        console.log(`   Status: ${sampleRecord.status}`);
        console.log(`   Time In: ${sampleRecord.timeIn || 'N/A'}`);
        console.log(`   Time Out: ${sampleRecord.timeOut || 'N/A'}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

testSessionsAPI();