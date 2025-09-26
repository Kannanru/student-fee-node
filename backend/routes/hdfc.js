const express = require('express');
const router = express.Router();
const controller = require('../controllers/hdfcController');
const auth = require('../middleware/auth');

// Initiate payment (protected)
router.post('/initiate', auth, controller.initiate);

// Gateway callback (usually unauthenticated, IP allowlist recommended)
router.post('/callback', controller.callback);

module.exports = router;
