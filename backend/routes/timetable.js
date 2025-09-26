const express = require('express');
const router = express.Router();
const controller = require('../controllers/timetableController');
const auth = require('../middleware/auth');

router.post('/', auth, controller.create);
router.get('/', auth, controller.list);
router.get('/student/:studentId', auth, controller.getByStudent);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.remove);

module.exports = router;
