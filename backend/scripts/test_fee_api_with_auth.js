const axios = require('axios');

async function testFeeAPIWithAuth() {
  try {
    console.log('🔑 Getting authentication token...\n');

    // Login to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@mgdc.ac.in',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful, got token');

    // Set up headers
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\n🧪 Testing Fee Reports API...\n');

    const baseURL = 'http://localhost:5000/api/fees';
    
    // Test 1: Daily payments without program filter
    console.log('1️⃣ Testing daily payments (no program filter):');
    try {
      const response1 = await axios.get(`${baseURL}/daily-payments`, {
        params: {
          fromDate: '2025-10-20',
          toDate: '2025-10-27'
        },
        headers
      });
      console.log(`✅ Success: Found ${response1.data.count} payments`);
      if (response1.data.data.length > 0) {
        console.log(`   Sample: ${response1.data.data[0].studentName} - ₹${response1.data.data[0].amount} - ${response1.data.data[0].program}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
    }

    // Test 2: Daily payments with BDS program filter
    console.log('\n2️⃣ Testing daily payments (BDS program filter):');
    try {
      const response2 = await axios.get(`${baseURL}/daily-payments`, {
        params: {
          fromDate: '2025-10-20',
          toDate: '2025-10-27',
          program: 'BDS'
        },
        headers
      });
      console.log(`✅ Success: Found ${response2.data.count} BDS payments`);
      if (response2.data.data.length > 0) {
        console.log(`   Sample: ${response2.data.data[0].studentName} - ₹${response2.data.data[0].amount} - ${response2.data.data[0].program}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
    }

  } catch (error) {
    console.error('❌ General Error:', error.message);
  }
}

testFeeAPIWithAuth();