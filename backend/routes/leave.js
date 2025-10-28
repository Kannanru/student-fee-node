const express = require('express');
const router = express.Router();
const controller = require('../controllers/leaveController');
const auth = require('../middleware/auth');

// Apply leave
router.post('/apply', auth, controller.applyLeave);

// Get all leaves (with filters)
router.get('/', auth, controller.getAllLeaves);

// Get leave statistics
router.get('/stats', auth, controller.getLeaveStats);

// Get students on leave for a specific date
router.get('/on-leave', auth, controller.getStudentsOnLeave);

// Get leave by ID
router.get('/:id', auth, controller.getLeaveById);

// Get leaves for a specific student
router.get('/student/:studentId', auth, controller.getStudentLeaves);

// Approve leave
router.put('/:id/approve', auth, controller.approveLeave);

// Reject leave
router.put('/:id/reject', auth, controller.rejectLeave);

// Delete leave
router.delete('/:id', auth, controller.deleteLeave);

module.exports = router;
