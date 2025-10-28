// routes/feeHead.js
const express = require('express');
const router = express.Router();
const feeHeadController = require('../controllers/feeHeadController');
const auth = require('../middleware/auth');

router.get('/', auth, feeHeadController.list);
router.get('/active', auth, feeHeadController.getActive);
router.get('/:id', auth, feeHeadController.getById);
router.post('/', auth, feeHeadController.create);
router.put('/:id', auth, feeHeadController.update);
router.patch('/:id/status', auth, feeHeadController.toggleStatus);
router.delete('/:id', auth, feeHeadController.remove);

module.exports = router;
