const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const marksController = require('../controllers/internalMarksController');

// Get all marks (with optional filters)
router.get('/', auth, marksController.getAllMarks);

// Get marks for a specific student
router.get('/student/:studentId', auth, marksController.getStudentMarks);

// Get marks for a student by academic year
router.get('/student/:studentId/year/:academicYear', auth, marksController.getStudentMarksByYear);

// Save marks (create or update)
router.post('/', auth, marksController.saveMarks);

// Bulk save marks
router.post('/bulk', auth, marksController.bulkSaveMarks);

// Delete marks entry
router.delete('/:id', auth, marksController.deleteMarks);

module.exports = router;
