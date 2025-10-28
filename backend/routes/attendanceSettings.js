const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/attendanceSettingsController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Settings routes
router.post('/', settingsController.createSettings);
router.get('/', settingsController.getAllSettings);
router.get('/applicable', settingsController.getApplicableSettings);
router.get('/:id', settingsController.getSettingsById);
router.put('/:id', settingsController.updateSettings);
router.delete('/:id', settingsController.deleteSettings);

// Global defaults
router.post('/global', settingsController.setGlobalDefaults);
router.put('/global', settingsController.setGlobalDefaults);

module.exports = router;
