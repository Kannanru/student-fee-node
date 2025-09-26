// routes/feePlan.js
const express = require('express');
const router = express.Router();
const feePlanController = require('../controllers/feePlanController');
const auth = require('../middleware/auth');

router.get('/', auth, feePlanController.list);
router.post('/', auth, feePlanController.create);
router.put('/:id', auth, feePlanController.update);
router.delete('/:id', auth, feePlanController.remove);

module.exports = router;
