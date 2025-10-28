/**
 * Dashboard Routes
 * 
 * API endpoints for Fee Management Dashboard
 * 
 * Base path: /api/dashboard
 * All routes require authentication
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/dashboard/fee-stats
 * @desc    Get fee statistics (Total Collection, Pending Amount, Student Status, Average Payment)
 * @access  Private (Admin, Accountant, Viewer)
 * @query   academicYear, department, semester, quota
 */
router.get('/fee-stats', auth, dashboardController.getFeeStats);

/**
 * @route   GET /api/dashboard/recent-payments
 * @desc    Get recent payments list
 * @access  Private (Admin, Accountant, Viewer)
 * @query   limit (default 10), academicYear, quota, department
 */
router.get('/recent-payments', auth, dashboardController.getRecentPayments);

/**
 * @route   GET /api/dashboard/defaulters
 * @desc    Get fee defaulters (overdue students)
 * @access  Private (Admin, Accountant, Viewer)
 * @query   limit (default 10), academicYear, department, year, quota, minDaysOverdue
 */
router.get('/defaulters', auth, dashboardController.getDefaulters);

/**
 * @route   GET /api/dashboard/collection-summary
 * @desc    Get collection summary (by fee head, payment mode, quota)
 * @access  Private (Admin, Accountant, Viewer)
 * @query   academicYear, startDate, endDate
 */
router.get('/collection-summary', auth, dashboardController.getCollectionSummary);

/**
 * @route   GET /api/dashboard/overview
 * @desc    Get complete dashboard data (all widgets + panels in one call)
 * @access  Private (Admin, Accountant, Viewer)
 * @query   academicYear, department, semester, quota
 */
router.get('/overview', auth, dashboardController.getDashboardOverview);

module.exports = router;
