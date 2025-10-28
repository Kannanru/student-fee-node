// middleware/cameraMiddleware.js
// Camera Data Transformation Middleware
// Handles AI camera response normalization and test data generation

const Student = require('../models/Student');
const Hall = require('../models/Hall');

/**
 * Transform AI camera response to standardized format
 * This middleware handles different camera vendor formats
 */
class CameraMiddleware {
  
  /**
   * Normalize camera data from various AI camera formats
   * Supports multiple vendor formats (Hikvision, Dahua, Custom, etc.)
   */
  static async transformCameraData(rawCameraData) {
    try {
      // Detect camera vendor/format
      const vendor = this.detectVendor(rawCameraData);
      
      let standardizedData;
      
      switch (vendor) {
        case 'HIKVISION':
          standardizedData = this.transformHikvision(rawCameraData);
          break;
        case 'DAHUA':
          standardizedData = this.transformDahua(rawCameraData);
          break;
        case 'CUSTOM':
          standardizedData = this.transformCustom(rawCameraData);
          break;
        default:
          // Assume standard format
          standardizedData = this.transformStandard(rawCameraData);
      }
      
      // Validate student exists
      const student = await Student.findOne({ studentId: standardizedData.student_id });
      if (student) {
        standardizedData.studentRegNo = student.registrationNumber;
        standardizedData.studentName = student.studentName;
        standardizedData.program = student.programName;
      }
      
      // Validate hall exists
      const hall = await Hall.findOne({ cameraId: standardizedData.camera_id });
      if (hall) {
        standardizedData.hall_id = hall.hallId;
        standardizedData.hallName = hall.hallName;
      }
      
      return standardizedData;
      
    } catch (error) {
      console.error('Error transforming camera data:', error);
      throw error;
    }
  }
  
  /**
   * Detect camera vendor from response structure
   */
  static detectVendor(data) {
    if (data.deviceSerial) return 'HIKVISION';
    if (data.channelId) return 'DAHUA';
    if (data.vendorId === 'CUSTOM') return 'CUSTOM';
    return 'STANDARD';
  }
  
  /**
   * Transform Hikvision camera format
   * Example: { deviceSerial: 'CAM001', faceId: 'STU001', confidence: 0.95, ... }
   */
  static transformHikvision(data) {
    return {
      student_id: data.faceId || data.personId,
      camera_id: data.deviceSerial,
      timestamp: new Date(data.captureTime || Date.now()),
      direction: data.eventType === 'ENTRY' ? 'IN' : 'OUT',
      confidence: data.similarity || data.confidence || 0.9,
      spoof_score: data.livenessScore ? (1 - data.livenessScore) : 0.05,
      image_url: data.faceUrl || null,
      temperature: data.temperature || null
    };
  }
  
  /**
   * Transform Dahua camera format
   */
  static transformDahua(data) {
    return {
      student_id: data.userId || data.personId,
      camera_id: data.channelId,
      timestamp: new Date(data.eventTime || Date.now()),
      direction: data.accessType === 1 ? 'IN' : 'OUT',
      confidence: data.matchScore || 0.9,
      spoof_score: data.antiSpoofing ? 0.02 : 0.15,
      image_url: data.snapUrl || null,
      temperature: data.bodyTemp || null
    };
  }
  
  /**
   * Transform custom camera format
   */
  static transformCustom(data) {
    return {
      student_id: data.id,
      camera_id: data.cam,
      timestamp: new Date(data.ts || Date.now()),
      direction: data.dir,
      confidence: data.conf,
      spoof_score: data.spoof,
      image_url: data.img || null,
      temperature: data.temp || null
    };
  }
  
  /**
   * Transform standard format (already in correct format)
   */
  static transformStandard(data) {
    return {
      student_id: data.student_id,
      camera_id: data.camera_id,
      timestamp: new Date(data.timestamp || Date.now()),
      direction: data.direction || 'IN',
      confidence: data.confidence || 0.9,
      spoof_score: data.spoof_score || 0.05,
      image_url: data.image_url || null,
      temperature: data.temperature || null
    };
  }
  
  /**
   * Generate test data for development/testing
   * Simulates realistic student entry/exit patterns
   * @param {Object} filters - Optional filters { programName, year, section }
   */
  static async generateTestData(filters = {}) {
    try {
      // Build query based on filters
      const query = {};
      if (filters.programName) query.programName = filters.programName;
      if (filters.year) query.year = parseInt(filters.year);
      if (filters.section) query.section = filters.section;
      
      // Get students based on filters
      const students = await Student.find(query).limit(50);
      
      // Get all halls
      const halls = await Hall.find();
      
      if (students.length === 0) {
        console.log('No students found for test data generation with filters:', filters);
        return null;
      }
      
      if (halls.length === 0) {
        console.log('No halls found for test data generation');
        return null;
      }
      
      // Test data patterns
      const patterns = [
        { type: 'ENTRY_ONLY', probability: 0.4 }, // Student enters only
        { type: 'ENTRY_EXIT', probability: 0.4 },  // Student enters and exits
        { type: 'EXIT_ONLY', probability: 0.1 },   // Student exits only (late entry)
        { type: 'MULTIPLE_ENTRY', probability: 0.1 } // Student enters multiple times
      ];
      
      // Select random pattern
      const rand = Math.random();
      let cumulativeProbability = 0;
      let selectedPattern = patterns[0];
      
      for (const pattern of patterns) {
        cumulativeProbability += pattern.probability;
        if (rand <= cumulativeProbability) {
          selectedPattern = pattern;
          break;
        }
      }
      
      // Generate test events based on pattern
      const events = [];
      const randomStudent = students[Math.floor(Math.random() * students.length)];
      const randomHall = halls[Math.floor(Math.random() * halls.length)];
      
      const baseTime = new Date();
      
      switch (selectedPattern.type) {
        case 'ENTRY_ONLY':
          events.push(this.createTestEvent(randomStudent, randomHall, 'IN', baseTime));
          break;
          
        case 'ENTRY_EXIT':
          events.push(this.createTestEvent(randomStudent, randomHall, 'IN', baseTime));
          // Exit after 45-60 minutes
          const exitTime = new Date(baseTime.getTime() + (45 + Math.random() * 15) * 60000);
          events.push(this.createTestEvent(randomStudent, randomHall, 'OUT', exitTime));
          break;
          
        case 'EXIT_ONLY':
          events.push(this.createTestEvent(randomStudent, randomHall, 'OUT', baseTime));
          break;
          
        case 'MULTIPLE_ENTRY':
          events.push(this.createTestEvent(randomStudent, randomHall, 'IN', baseTime));
          const reEntryTime = new Date(baseTime.getTime() + 10 * 60000); // 10 min later
          events.push(this.createTestEvent(randomStudent, randomHall, 'IN', reEntryTime));
          break;
      }
      
      // Return first event (simulate real-time one-by-one)
      return events[0];
      
    } catch (error) {
      console.error('Error generating test data:', error);
      return null;
    }
  }
  
  /**
   * Create a single test event
   */
  static createTestEvent(student, hall, direction, timestamp) {
    // Simulate realistic confidence and spoof scores
    const confidence = 0.85 + Math.random() * 0.14; // 0.85 to 0.99
    const spoofScore = Math.random() * 0.08; // 0 to 0.08 (below threshold)
    
    // Occasionally generate low-confidence events for testing
    const isLowConfidence = Math.random() < 0.05; // 5% chance
    const isSpoofAttempt = Math.random() < 0.02; // 2% chance
    
    return {
      student_id: student.studentId,
      studentRegNo: student.registrationNumber,
      studentName: student.studentName,
      program: student.programName,
      camera_id: hall.cameraId,
      hall_id: hall.hallId,
      hallName: hall.hallName,
      timestamp: timestamp,
      direction: direction,
      confidence: isLowConfidence ? 0.60 + Math.random() * 0.2 : confidence,
      spoof_score: isSpoofAttempt ? 0.15 + Math.random() * 0.3 : spoofScore,
      image_url: `/images/face_captures/${student.studentId}_${Date.now()}.jpg`,
      temperature: 36.0 + Math.random() * 1.5 // 36.0 to 37.5°C
    };
  }
  
  /**
   * Express middleware function
   */
  static async processCameraRequest(req, res, next) {
    try {
      const rawData = req.body;
      
      // Check if test mode
      if (rawData.testMode || process.env.CAMERA_TEST_MODE === 'true') {
        const testData = await CameraMiddleware.generateTestData();
        if (testData) {
          req.body = testData;
          console.log(`[TEST MODE] Generated camera event: ${testData.studentName} - ${testData.direction} - ${testData.hallName}`);
        }
      } else {
        // Transform real camera data
        req.body = await CameraMiddleware.transformCameraData(rawData);
      }
      
      next();
    } catch (error) {
      console.error('Camera middleware error:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid camera data format',
        error: error.message
      });
    }
  }
}

module.exports = CameraMiddleware;
