// routes/payment.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.get('/', auth, controller.list);
router.get('/all', auth, controller.listAll); // Alternative path for frontend
router.post('/', auth, controller.create);
router.post('/fee-payment', auth, controller.createFeePayment); // Fee collection payment
router.post('/collect-fee', auth, controller.collectFee); // New fee collection endpoint

module.exports = router;
