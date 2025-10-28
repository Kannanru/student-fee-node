// routes/audit.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/auditController');
const auth = require('../middleware/auth');

router.get('/', auth, controller.list);

module.exports = router;
