// routes/concession.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/concessionController');
const auth = require('../middleware/auth');

router.get('/', auth, controller.list);
router.post('/', auth, controller.create);
router.put('/:id', auth, controller.update);

module.exports = router;
