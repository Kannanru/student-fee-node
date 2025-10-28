const express = require('express');
const router = express.Router();
const controller = require('../controllers/studentController');
const auth = require('../middleware/auth');

// Public login for mobile
router.post('/login', controller.login);

// CRUD + listing (protected)
router.get('/', auth, controller.list);
router.post('/', auth, controller.create);
router.put('/:id', auth, controller.update);
router.get('/profile/:id', auth, controller.getById);
router.delete('/:id', auth, controller.remove);

// Get student fees
router.get('/:id/fees', auth, controller.getStudentFees);

// Get student fee status (structure + payment history)
router.get('/:id/fee-status', auth, controller.getStudentFeeStatus);

// Get all fee structures for a student
router.get('/:id/fee-structures', auth, controller.getStudentFeeStructures);

// Get fee heads with payment status for a specific fee structure
router.get('/:id/fee-structures/:structureId/heads', auth, controller.getFeeHeadsWithPaymentStatus);

// Get semester-wise fee details for a student
router.get('/:id/semesters/:semester/fees', auth, controller.getStudentSemesterFees);

module.exports = router;
