const express = require('express');
const router = express.Router();
const controller = require('../controllers/studentController');
const auth = require('../middleware/auth');

// Public login for mobile
router.post('/login', controller.login);

// CRUD + listing (protected)
router.get('/', auth, controller.list);
router.post('/', auth, controller.create);
router.put('/:id', auth, controller.update);
router.get('/profile/:id', auth, controller.getById);

module.exports = router;
