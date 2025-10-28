const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/classSessionController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Session management
router.post('/', sessionController.createSession);
router.post('/generate', sessionController.generateSessionsFromTimetable);
router.get('/', sessionController.getSessionsByDate);
router.get('/ongoing', sessionController.getOngoingSessions);
router.get('/:id', sessionController.getSessionById);
router.get('/:id/attendance', sessionController.getSessionAttendance);
router.patch('/:id/status', sessionController.updateSessionStatus);
router.delete('/:id', sessionController.deleteSession);

module.exports = router;
