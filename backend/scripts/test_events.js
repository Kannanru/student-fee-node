const axios = require('axios');

async function testSingleEvent() {
    console.log('\n🎯 Testing Single Event Generation...\n');
    
    try {
        const response = await axios.get('http://localhost:5000/api/test-camera/generate');
        
        console.log('✅ SUCCESS!');
        console.log('\nResponse:');
        console.log('- Success:', response.data.success);
        console.log('- Message:', response.data.message);
        
        if (response.data.testData) {
            console.log('\nTest Data Generated:');
            console.log('- Student ID:', response.data.testData.studentId);
            console.log('- Hall ID:', response.data.testData.hallId);
            console.log('- Direction:', response.data.testData.direction);
            console.log('- Confidence:', (response.data.testData.confidence * 100).toFixed(0) + '%');
            console.log('- Timestamp:', new Date(response.data.testData.timestamp).toLocaleString());
        }
        
        if (response.data.processingResult) {
            console.log('\nProcessing Result:');
            console.log('- Success:', response.data.processingResult.success);
            console.log('- Status:', response.data.processingResult.attendance?.status);
        }
        
        console.log('\n📊 Event should now appear on real-time dashboard!');
        console.log('👉 Check: http://localhost:4200/attendance/realtime\n');
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

// Generate 5 events
async function generateMultiple() {
    console.log('🚀 Generating 5 events with 2-second delay...\n');
    
    for (let i = 1; i <= 5; i++) {
        console.log(`\n[${i}/5] Generating event...`);
        await testSingleEvent();
        
        if (i < 5) {
            console.log('⏳ Waiting 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    console.log('\n✅ All 5 events generated!');
    console.log('Check your real-time dashboard now!\n');
}

generateMultiple();
