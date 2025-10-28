const express = require('express');
const router = express.Router();
const controller = require('../controllers/attendanceController');
const cameraEventController = require('../controllers/cameraEventController');
const CameraMiddleware = require('../middleware/cameraMiddleware');
const auth = require('../middleware/auth');

// Camera event endpoint (AI-based attendance) - with camera middleware
router.post('/event', CameraMiddleware.processCameraRequest, cameraEventController.processCameraEvent);
router.get('/events/unprocessed', auth, cameraEventController.getUnprocessedEvents);
router.get('/events/exceptions', auth, cameraEventController.getExceptionEvents);
router.get('/events/session/:sessionId', auth, cameraEventController.getEventsBySession);

// Ingestion / record (AI or Admin)
router.post('/record', auth, controller.record);

// Student views
router.get('/student/:studentId/daily', auth, controller.getStudentDaily);
router.get('/student/:studentId/summary', auth, controller.getStudentSummary);

// Admin reports
router.get('/admin/daily', auth, controller.adminDailyReport);
router.get('/admin/summary', auth, controller.adminSummary);
router.get('/admin/occupancy', auth, controller.adminOccupancy);
router.get('/admin/export', auth, controller.adminExportCsv);
router.get('/admin/export.pdf', auth, controller.adminExportPdf);
router.get('/stream', controller.sseStream); // SSE stream (no auth to allow dashboards; secure in production)

// Logs & corrections
router.get('/logs', auth, controller.listLogs);
router.post('/correction', auth, controller.requestCorrection);
router.post('/:id/correction/review', auth, controller.reviewCorrection);

module.exports = router;
