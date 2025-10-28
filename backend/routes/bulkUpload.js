/**
 * Bulk Upload Routes
 * POST /api/bulk-upload/fees - Upload Excel file with fee data
 * GET /api/bulk-upload/template - Download sample Excel template
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const bulkUploadController = require('../controllers/bulkUploadController');

// Configure multer for memory storage (process buffer directly)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only Excel files
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.match(/\.(xlsx|xls)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  }
});

// Protected routes (admin only)
router.post('/fees', 
  auth, 
  upload.single('file'),
  bulkUploadController.bulkUploadFees
);

router.get('/template', 
  auth,
  bulkUploadController.downloadTemplate
);

module.exports = router;
