const express = require('express');
const path = require('path');
const router = express.Router();
const adminController = require('../controllers/adminController');

const ROOT = path.resolve(__dirname, '..');

// Protected dashboard HTML page. Token can be provided via Authorization: Bearer <token> or ?token= query param
router.get('/dashboard', adminController.dashboardPage);

// Standard links served via backend
router.get('/home', (req, res) => {
	res.sendFile(path.join(ROOT, 'public', 'mgdc_home.html'));
});

router.get('/docs', (req, res) => {
	// Serve the professional dark-themed docs by default
	const darkPath = path.join(ROOT, 'public', 'api_documentation_dark.html');
	res.sendFile(darkPath);
});

router.get('/postman-collection.json', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'docs', 'postman_collection.json'));
});

router.get('/requests.http', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'requests.http'));
});

// Serve latest automated API test report (Markdown)
router.get('/test-report.md', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'docs', 'test_report.md'));
});

router.get('/test-report.json', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'docs', 'test_report.json'));
});

// Simple HTML page to view the Markdown report
router.get('/test-report', (req, res) => {
	res.sendFile(path.join(ROOT, 'public', 'test_report.html'));
});

module.exports = router;
