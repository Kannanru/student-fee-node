const express = require('express');
const router = express.Router();
const controller = require('../controllers/employeeController');
const auth = require('../middleware/auth');

// Statistics route (must be before :id route)
router.get('/stats', auth, controller.getStats);

// CRUD routes
router.get('/', auth, controller.list);
router.post('/', auth, controller.create);
router.get('/:id', auth, controller.getById);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.delete);

module.exports = router;
