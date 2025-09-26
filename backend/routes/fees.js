const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const auth = require('../middleware/auth');

// Create/Manage fee structures (admin)
router.post('/structure', auth, feeController.createFeeStructure);

// Student Fee Details for Mobile App (protected or public as needed)
router.get('/student/:studentId', auth, feeController.getStudentFeeDetails);

// Payment Processing
router.post('/:feeId/payment', auth, feeController.processPayment);

// Payment History
router.get('/student/:studentId/payments', auth, feeController.getPaymentHistory);

module.exports = router;
