const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const auth = require('../middleware/auth');

// Create/Manage fee structures (admin)
router.post('/structure', auth, feeController.createFeeStructure);

// Student Fee Details for Mobile App (protected or public as needed)
router.get('/student/:studentId', auth, feeController.getStudentFeeDetails);

// Student Fee Records (all fee records for a student)
router.get('/student/:studentId/records', auth, feeController.getStudentFeeRecords);

// Payment Processing
router.post('/:feeId/payment', auth, feeController.processPayment);
router.post('/payment/:feeId', auth, feeController.processPayment); // Alternative path for frontend

// Payment History
router.get('/student/:studentId/payments', auth, feeController.getPaymentHistory);
router.get('/payment-history/:studentId', auth, feeController.getPaymentHistory); // Alternative path for frontend
router.get('/payment-history/student/:studentId', auth, feeController.getPaymentHistory); // Alternative path

// Fee Collection Summary
router.get('/collection-summary', auth, feeController.getCollectionSummary);

// Fee Defaulters
router.get('/defaulters', auth, feeController.getDefaulters);

// Enhanced Fee Reports
router.get('/collection-report', auth, feeController.getCollectionReport);
router.get('/department-summary', auth, feeController.getDepartmentSummary);
router.get('/fee-head-summary', auth, feeController.getFeeHeadSummary);
router.get('/payment-history-report', auth, feeController.getPaymentHistoryReport);

// Daily Reports (like attendance reports)
router.get('/daily-payments', auth, feeController.getDailyPayments);
router.get('/daily-department-summary', auth, feeController.getDailyDepartmentSummary);
router.get('/daily-payment-methods', auth, feeController.getDailyPaymentMethods);

module.exports = router;
