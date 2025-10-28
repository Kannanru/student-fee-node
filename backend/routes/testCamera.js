// routes/testCamera.js
// Test Camera Data Generation Routes (Development Only)

const express = require('express');
const router = express.Router();
const CameraMiddleware = require('../middleware/cameraMiddleware');
const axios = require('axios');

/**
 * Generate and send test camera event
 * GET/POST /api/test-camera/generate
 * Body (optional): { programName: 'BDS', year: 1, section: 'A' }
 */
router.get('/generate', async (req, res) => {
  await generateTestEvent(req, res);
});

router.post('/generate', async (req, res) => {
  await generateTestEvent(req, res);
});

async function generateTestEvent(req, res) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Test endpoints disabled in production'
      });
    }

    // Get class filter from request body or query params
    const { programName, year, section } = req.body || req.query;
    
    // Generate test data with class filter
    const testData = await CameraMiddleware.generateTestData({
      programName,
      year: year ? parseInt(year) : undefined,
      section
    });
    
    if (!testData) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate test data. Ensure students exist for the selected class.'
      });
    }

    // Send to camera event endpoint
    const response = await axios.post('http://localhost:5000/api/attendance/event', {
      ...testData,
      testMode: true
    });

    res.json({
      success: true,
      message: 'Test camera event generated and processed',
      testData,
      processingResult: response.data
    });

  } catch (error) {
    console.error('Error generating test data:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating test data',
      error: error.message
    });
  }
}

/**
 * Start continuous test data generation
 * POST /api/test-camera/start-simulation
 * Body: { interval: 5000, count: 10 }
 */
router.post('/start-simulation', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Test endpoints disabled in production'
      });
    }

    const { interval = 5000, count = 10 } = req.body;

    res.json({
      success: true,
      message: `Simulation started: ${count} events every ${interval}ms`,
      info: 'Check server console for events'
    });

    // Start simulation in background
    let eventsSent = 0;
    const simulationInterval = setInterval(async () => {
      if (eventsSent >= count) {
        clearInterval(simulationInterval);
        console.log(`✅ Simulation complete: ${eventsSent} events sent`);
        return;
      }

      try {
        const testData = await CameraMiddleware.generateTestData();
        if (testData) {
          await axios.post('http://localhost:5000/api/attendance/event', {
            ...testData,
            testMode: true
          });
          eventsSent++;
          console.log(`📡 Test event ${eventsSent}/${count} sent: ${testData.studentName} - ${testData.direction}`);
        }
      } catch (error) {
        console.error('Error in simulation:', error.message);
      }
    }, interval);

  } catch (error) {
    console.error('Error starting simulation:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting simulation',
      error: error.message
    });
  }
});

/**
 * Generate specific pattern
 * POST /api/test-camera/pattern
 * Body: { studentId: 'STU001', pattern: 'ENTRY_EXIT' }
 */
router.post('/pattern', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Test endpoints disabled in production'
      });
    }

    const { studentId, pattern, hallId } = req.body;
    
    const Student = require('../models/Student');
    const Hall = require('../models/Hall');

    const student = await Student.findOne({ studentId });
    const hall = await Hall.findOne({ hallId: hallId || { $exists: true } });

    if (!student || !hall) {
      return res.status(404).json({
        success: false,
        message: 'Student or Hall not found'
      });
    }

    const baseTime = new Date();
    const events = [];

    switch (pattern) {
      case 'ENTRY_ONLY':
        events.push(CameraMiddleware.createTestEvent(student, hall, 'IN', baseTime));
        break;
      
      case 'ENTRY_EXIT':
        events.push(CameraMiddleware.createTestEvent(student, hall, 'IN', baseTime));
        const exitTime = new Date(baseTime.getTime() + 50 * 60000);
        events.push(CameraMiddleware.createTestEvent(student, hall, 'OUT', exitTime));
        break;
      
      case 'LATE_ENTRY':
        const lateTime = new Date(baseTime.getTime() + 15 * 60000);
        events.push(CameraMiddleware.createTestEvent(student, hall, 'IN', lateTime));
        break;
    }

    // Send events
    for (const event of events) {
      await axios.post('http://localhost:5000/api/attendance/event', {
        ...event,
        testMode: true
      });
    }

    res.json({
      success: true,
      message: `Pattern '${pattern}' executed`,
      eventsGenerated: events.length,
      events
    });

  } catch (error) {
    console.error('Error generating pattern:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating pattern',
      error: error.message
    });
  }
});

module.exports = router;
