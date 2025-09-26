// DEPRECATED: Legacy root route. Use backend/server.js with /api/penalty-config endpoints.
const express = require('express');
const router = express.Router();

router.use((req, res) => {
  res.status(410).json({ success: false, message: 'Deprecated endpoint. Use /backend/server.js mounted /api/penalty-config instead.' });
});

module.exports = router;