const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');

// Fee Structure Management
router.post('/structure', feeController.createFeeStructure);

// Student Fee Details for Mobile App
router.get('/student/:studentId', feeController.getStudentFeeDetails);

// Payment Processing
router.post('/:feeId/payment', feeController.processPayment);

// Payment History
router.get('/student/:studentId/payments', feeController.getPaymentHistory);

module.exports = router;