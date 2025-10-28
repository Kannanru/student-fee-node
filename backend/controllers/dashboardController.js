/**
 * Dashboard Controller
 * 
 * Handles HTTP requests for Fee Management Dashboard
 * 
 * Routes:
 * GET /api/dashboard/fee-stats - Fee statistics and metrics
 * GET /api/dashboard/recent-payments - Recent payment list
 * GET /api/dashboard/defaulters - Overdue students list
 * GET /api/dashboard/collection-summary - Collection breakdown
 */

const dashboardService = require('../services/dashboard.service');

/**
 * Get fee statistics for dashboard widgets
 * GET /api/dashboard/fee-stats
 * Query params: academicYear, department, semester, quota
 */
exports.getFeeStats = async (req, res) => {
  try {
    const { academicYear, department, semester, quota } = req.query;

    const filters = {};
    if (academicYear) filters.academicYear = academicYear;
    if (department) filters.department = department;
    if (semester) filters.semester = parseInt(semester);
    if (quota) filters.quota = quota;

    const result = await dashboardService.getFeeStats(filters);

    res.json(result);
  } catch (error) {
    console.error('Error in getFeeStats controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee statistics',
      error: error.message
    });
  }
};

/**
 * Get recent payments
 * GET /api/dashboard/recent-payments
 * Query params: limit, academicYear, quota
 */
exports.getRecentPayments = async (req, res) => {
  try {
    const { limit = 10, academicYear, quota, department } = req.query;

    const filters = {};
    if (academicYear) filters.academicYear = academicYear;
    if (quota) filters.quota = quota;
    if (department) filters.department = department;

    const result = await dashboardService.getRecentPayments(parseInt(limit), filters);

    res.json(result);
  } catch (error) {
    console.error('Error in getRecentPayments controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent payments',
      error: error.message
    });
  }
};

/**
 * Get fee defaulters (overdue students)
 * GET /api/dashboard/defaulters
 * Query params: limit, academicYear, department, year, quota, minDaysOverdue
 */
exports.getDefaulters = async (req, res) => {
  try {
    const { 
      limit = 10, 
      academicYear, 
      department, 
      year, 
      quota, 
      minDaysOverdue 
    } = req.query;

    const filters = {};
    if (academicYear) filters.academicYear = academicYear;
    if (department) filters.department = department;
    if (year) filters.year = parseInt(year);
    if (quota) filters.quota = quota;
    if (minDaysOverdue) filters.minDaysOverdue = parseInt(minDaysOverdue);

    const result = await dashboardService.getDefaulters(parseInt(limit), filters);

    res.json(result);
  } catch (error) {
    console.error('Error in getDefaulters controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch defaulters',
      error: error.message
    });
  }
};

/**
 * Get collection summary (by head and mode)
 * GET /api/dashboard/collection-summary
 * Query params: academicYear, startDate, endDate
 */
exports.getCollectionSummary = async (req, res) => {
  try {
    const { academicYear, startDate, endDate } = req.query;

    const filters = {};
    if (academicYear) filters.academicYear = academicYear;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const result = await dashboardService.getCollectionSummary(filters);

    res.json(result);
  } catch (error) {
    console.error('Error in getCollectionSummary controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collection summary',
      error: error.message
    });
  }
};

/**
 * Get dashboard overview (all data in one call)
 * GET /api/dashboard/overview
 * Query params: academicYear, department, semester, quota
 */
exports.getDashboardOverview = async (req, res) => {
  try {
    const { academicYear, department, semester, quota } = req.query;

    const filters = {};
    if (academicYear) filters.academicYear = academicYear;
    if (department) filters.department = department;
    if (semester) filters.semester = parseInt(semester);
    if (quota) filters.quota = quota;

    // Fetch all dashboard data in parallel
    const [
      feeStats,
      recentPayments,
      defaulters,
      collectionSummary
    ] = await Promise.all([
      dashboardService.getFeeStats(filters),
      dashboardService.getRecentPayments(10, filters),
      dashboardService.getDefaulters(10, filters),
      dashboardService.getCollectionSummary(filters)
    ]);

    res.json({
      success: true,
      data: {
        stats: feeStats.data,
        recentPayments: recentPayments.data,
        defaulters: defaulters.data,
        collectionSummary: collectionSummary.data
      },
      filters,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error in getDashboardOverview controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview',
      error: error.message
    });
  }
};
