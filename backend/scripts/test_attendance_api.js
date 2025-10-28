// Complete test of the attendance API
const axios = require('axios');

async function testAttendanceAPI() {
  try {
    console.log('🔐 Logging in...');
    
    // Login first
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@admin.com',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + JSON.stringify(loginResponse.data));
    }

    console.log('✅ Login successful!');
    const token = loginResponse.data.token;
    
    // Test attendance summary API
    console.log('\n📊 Testing attendance summary API...');
    const attendanceResponse = await axios.get(
      'http://localhost:5000/api/attendance/admin/summary?startDate=2025-10-24&endDate=2025-10-24',
      { 
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ API Response Status:', attendanceResponse.status);
    console.log('✅ API Response Data:', JSON.stringify(attendanceResponse.data, null, 2));

    // If data is empty, check if we have any attendance records at all
    if (!attendanceResponse.data.data || attendanceResponse.data.data.length === 0) {
      console.log('\n🔍 Checking if any attendance records exist...');
      
      const allAttendanceResponse = await axios.get(
        'http://localhost:5000/api/attendance/admin/summary?startDate=2025-10-20&endDate=2025-10-30',
        { 
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('📅 Weekly range data:', JSON.stringify(allAttendanceResponse.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testAttendanceAPI();