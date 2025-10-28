// Test login to get valid JWT token for API testing
require('dotenv').config();
const axios = require('axios');

const baseURL = 'http://localhost:5000';

async function testLogin() {
  try {
    console.log('🔐 Testing login to get valid JWT token...');
    
    // Try common admin credentials
    const credentials = [
      { email: 'admin@mgc.edu', password: 'admin123' },
      { email: 'admin@mgc.com', password: 'admin123' },
      { email: 'admin@college.edu', password: 'password' },
      { email: 'admin', password: 'admin' },
      { email: 'admin@admin.com', password: 'admin' }
    ];

    for (const cred of credentials) {
      try {
        console.log(`Trying: ${cred.email} / ${cred.password}`);
        
        const response = await axios.post(`${baseURL}/api/auth/login`, cred);
        
        if (response.data.success && response.data.token) {
          console.log('✅ Login successful!');
          console.log('Token:', response.data.token.substring(0, 50) + '...');
          console.log('User:', response.data.user.email, '-', response.data.user.role);
          
          // Test attendance API with this token
          console.log('\n📊 Testing attendance API...');
          const attendanceResponse = await axios.get(
            `${baseURL}/api/attendance/admin/summary?startDate=2025-10-24&endDate=2025-10-24`,
            { 
              headers: { 
                'Authorization': `Bearer ${response.data.token}` 
              }
            }
          );
          
          console.log('✅ Attendance API Response:', JSON.stringify(attendanceResponse.data, null, 2));
          return response.data.token;
        }
      } catch (error) {
        if (error.response) {
          console.log(`❌ Failed: ${error.response.status} - ${error.response.data.message || error.response.data}`);
        } else {
          console.log(`❌ Network error: ${error.message}`);
        }
      }
    }
    
    console.log('\n❌ No valid credentials found');
    return null;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Run the test
testLogin();