// routes/settings.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/settingsController');
const auth = require('../middleware/auth');

router.get('/', auth, controller.get);
router.put('/', auth, controller.update);

module.exports = router;
