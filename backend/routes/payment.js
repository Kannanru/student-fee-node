// routes/payment.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.get('/', auth, controller.list);
router.post('/', auth, controller.create);

module.exports = router;
