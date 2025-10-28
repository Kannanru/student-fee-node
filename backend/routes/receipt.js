/**
 * Receipt Routes
 * Handles PDF receipt generation
 */

const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');
const auth = require('../middleware/auth');

// Get receipt data for PDF generation
router.get('/:paymentId', auth, receiptController.getReceiptData);

// Generate PDF receipt
router.get('/:paymentId/pdf', auth, receiptController.generateReceiptPDF);

module.exports = router;
