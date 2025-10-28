// backend/routes/achievements.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const achievementController = require('../controllers/achievementController');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/achievements');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'achievement-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Get achievements for a specific student
router.get('/student/:studentId', auth, achievementController.getStudentAchievements);

// Get all pending achievements (admin only)
router.get('/pending', auth, isAdmin, achievementController.getPendingAchievements);

// Upload achievement image
router.post('/upload-image', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/achievements/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        imageUrl: imageUrl,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

// Create new achievement
router.post('/', auth, achievementController.createAchievement);

// Approve achievement (admin only)
router.put('/:id/approve', auth, isAdmin, achievementController.approveAchievement);

// Reject achievement (admin only)
router.put('/:id/reject', auth, isAdmin, achievementController.rejectAchievement);

// Get achievement by ID
router.get('/:id', auth, achievementController.getAchievementById);

// Delete achievement (admin only)
router.delete('/:id', auth, isAdmin, achievementController.deleteAchievement);

module.exports = router;
