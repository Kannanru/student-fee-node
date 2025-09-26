const express = require('express');
const router = express.Router();
const controller = require('../controllers/razorpayController');
const auth = require('../middleware/auth');

router.post('/order', auth, controller.createOrder);
router.post('/verify', controller.verifySignature); // webhook style or client POST after payment

module.exports = router;
