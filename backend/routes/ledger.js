// routes/ledger.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/ledgerController');
const auth = require('../middleware/auth');

router.get('/:studentId', auth, controller.getByStudent);

module.exports = router;
