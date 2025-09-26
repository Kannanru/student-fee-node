// routes/feeHead.js
const express = require('express');
const router = express.Router();
const feeHeadController = require('../controllers/feeHeadController');
const auth = require('../middleware/auth');

router.get('/', auth, feeHeadController.list);
router.post('/', auth, feeHeadController.create);
router.put('/:id', auth, feeHeadController.update);
router.delete('/:id', auth, feeHeadController.remove);

module.exports = router;
