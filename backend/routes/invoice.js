// routes/invoice.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/invoiceController');
const auth = require('../middleware/auth');

router.get('/', auth, controller.list);
router.post('/', auth, controller.create);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.remove);

module.exports = router;
