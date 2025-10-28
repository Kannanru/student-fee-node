require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function startRealtimeSimulation() {
  console.log('🎬 Starting Real-time Attendance Simulation...\n');

  try {
    // Start continuous simulation with 50 events, 2 seconds apart
    console.log('📡 Sending request to start simulation...');
    const response = await axios.post(`${API_BASE}/api/test-camera/start-simulation`, {
      interval: 2000,  // 2 seconds between events
      count: 50        // Generate 50 events
    });

    console.log('✅ Simulation started successfully!');
    console.log(`   - Total events: ${response.data.totalEvents}`);
    console.log(`   - Interval: ${response.data.interval}ms`);
    console.log(`   - Estimated duration: ${(response.data.totalEvents * response.data.interval / 1000).toFixed(0)} seconds\n`);

    console.log('📊 Real-time attendance events are now being generated!');
    console.log('👉 Open your browser and navigate to:');
    console.log('   http://localhost:4200/attendance/realtime');
    console.log('\n💡 You will see:');
    console.log('   - Live attendance events appearing in real-time');
    console.log('   - Student IN/OUT status updates');
    console.log('   - Statistics updating automatically');
    console.log('   - Exception alerts for low confidence/spoof attempts');
    console.log('\n⏸️  Press Ctrl+C to stop this script (simulation will continue on server)\n');

    // Keep script alive to show it's working
    setInterval(() => {
      process.stdout.write('.');
    }, 2000);

  } catch (error) {
    console.error('❌ Error starting simulation:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

startRealtimeSimulation();
