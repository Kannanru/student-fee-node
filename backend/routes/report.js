// routes/report.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.get('/collections', auth, controller.collections);
router.get('/dues-aging', auth, controller.duesAging);
router.get('/scholarships', auth, controller.scholarships);
router.get('/refunds', auth, controller.refunds);

module.exports = router;
