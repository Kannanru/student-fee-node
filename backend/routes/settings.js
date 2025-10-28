// routes/settings.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/settingsController');
const auth = require('../middleware/auth');

router.get('/', auth, controller.get);
router.put('/', auth, controller.update);

// Specific route for late threshold
router.get('/late-threshold', auth, controller.getLateThreshold);
router.put('/late-threshold', auth, controller.updateLateThreshold);

module.exports = router;
