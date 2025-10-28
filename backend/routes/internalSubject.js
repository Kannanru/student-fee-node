const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const subjectController = require('../controllers/internalSubjectController');

// Get all subjects (with optional filters)
router.get('/', auth, subjectController.getAllSubjects);

// Get subjects by department and year
router.get('/department/:department/year/:year', auth, subjectController.getSubjectsByDepartmentYear);

// Get single subject
router.get('/:id', auth, subjectController.getSubjectById);

// Create new subject
router.post('/', auth, subjectController.createSubject);

// Update subject
router.put('/:id', auth, subjectController.updateSubject);

// Delete subject
router.delete('/:id', auth, subjectController.deleteSubject);

module.exports = router;
