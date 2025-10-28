const axios = require('axios');

async function testFeeAPI() {
  try {
    console.log('🧪 Testing Fee Reports API...\n');

    const baseURL = 'http://localhost:5000/api/fees';
    
    // Test 1: Daily payments without program filter
    console.log('1️⃣ Testing daily payments (no program filter):');
    try {
      const response1 = await axios.get(`${baseURL}/daily-payments`, {
        params: {
          fromDate: '2025-10-20',
          toDate: '2025-10-27'
        }
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
        }
      });
      console.log(`✅ Success: Found ${response2.data.count} BDS payments`);
      if (response2.data.data.length > 0) {
        console.log(`   Sample: ${response2.data.data[0].studentName} - ₹${response2.data.data[0].amount} - ${response2.data.data[0].program}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
    }

    // Test 3: Department summary with BDS
    console.log('\n3️⃣ Testing department summary (BDS program):');
    try {
      const response3 = await axios.get(`${baseURL}/daily-department-summary`, {
        params: {
          fromDate: '2025-10-20',
          toDate: '2025-10-27',
          program: 'BDS'
        }
      });
      console.log(`✅ Success: Found ${response3.data.count} department records`);
      if (response3.data.data.length > 0) {
        console.log(`   Sample: ${response3.data.data[0].program} Year ${response3.data.data[0].year} - ₹${response3.data.data[0].totalCollected}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
    }

    // Test 4: Payment methods summary
    console.log('\n4️⃣ Testing payment methods summary:');
    try {
      const response4 = await axios.get(`${baseURL}/daily-payment-methods`, {
        params: {
          fromDate: '2025-10-20',
          toDate: '2025-10-27'
        }
      });
      console.log(`✅ Success: Found ${response4.data.count} payment method records`);
      if (response4.data.data.length > 0) {
        console.log(`   Sample: ${response4.data.data[0].paymentMethod} - ₹${response4.data.data[0].totalAmount} (${response4.data.data[0].percentage}%)`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
    }

  } catch (error) {
    console.error('❌ General Error:', error.message);
  }
}

testFeeAPI();