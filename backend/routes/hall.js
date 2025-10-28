const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hallController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// CRUD routes
router.post('/', hallController.createHall);
router.get('/', hallController.getAllHalls);
router.get('/occupancy', hallController.getHallOccupancy);
router.get('/:id', hallController.getHallById);
router.put('/:id', hallController.updateHall);
router.delete('/:id', hallController.deleteHall);

// Camera status update
router.patch('/:id/camera-status', hallController.updateCameraStatus);

module.exports = router;
