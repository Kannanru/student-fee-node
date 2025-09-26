const express = require('express');
const router = express.Router();
const controller = require('../controllers/employeeController');
const auth = require('../middleware/auth');

router.get('/', auth, controller.list);
router.post('/', auth, controller.create);
router.get('/:id', auth, controller.getById);
router.put('/:id', auth, controller.update);

module.exports = router;
