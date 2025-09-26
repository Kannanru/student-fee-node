// routes/notification.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.post('/send', auth, controller.send);
router.get('/', auth, controller.list);

module.exports = router;
