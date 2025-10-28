const express = require('express');
const router = express.Router();
const controller = require('../controllers/penaltyController');
const auth = require('../middleware/auth');

router.post('/', auth, controller.createPenaltyConfig);
router.get('/', auth, controller.getAllPenaltyConfigs);
router.get('/year/:academicYear', auth, controller.getPenaltyConfigByYear);
router.put('/:id', auth, controller.updatePenaltyConfig);
router.delete('/:id', auth, controller.deletePenaltyConfig);

module.exports = router;
