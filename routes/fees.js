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

// DEPRECATED: This legacy route is no longer used. Use backend/server.js and routes under /api/*.
router.use((req, res) => {
  res.status(410).json({ success: false, message: 'Deprecated: Use backend routes mounted by backend/server.js' });
});

module.exports = router;