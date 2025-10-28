const express = require('express');
const router = express.Router();
const controller = require('../controllers/razorpayController');
const auth = require('../middleware/auth');

// Create order (frontend calls /create-order)
router.post('/create-order', auth, controller.createOrder);

// Verify payment (frontend calls /verify-payment)
router.post('/verify-payment', controller.verifySignature);

// Legacy routes (kept for backward compatibility)
router.post('/order', auth, controller.createOrder);
router.post('/verify', controller.verifySignature);

module.exports = router;
