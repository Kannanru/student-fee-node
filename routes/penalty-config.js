const express = require('express');
const router = express.Router();
const penaltyController = require('../controllers/penaltyController');

// Penalty Configuration Management (Master Data)
router.post('/', penaltyController.createPenaltyConfig);
router.get('/', penaltyController.getAllPenaltyConfigs);
router.get('/year/:academicYear', penaltyController.getPenaltyConfigByYear);
router.put('/:id', penaltyController.updatePenaltyConfig);
router.delete('/:id', penaltyController.deletePenaltyConfig);

module.exports = router;