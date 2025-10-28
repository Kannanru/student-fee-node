// server.js - Entry point for Node.js/Express backend
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(require('path').join(__dirname, 'public')));
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running.' });
});

// MongoDB connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mgdc_fees';
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const feeHeadRoutes = require('./routes/feeHead');
const feePlanRoutes = require('./routes/feePlan');
const quotaConfigRoutes = require('./routes/quotaConfig');
const installmentScheduleRoutes = require('./routes/installmentSchedule');
const invoiceRoutes = require('./routes/invoice');
const paymentRoutes = require('./routes/payment');
const refundRoutes = require('./routes/refund');
const concessionRoutes = require('./routes/concession');
const ledgerRoutes = require('./routes/ledger');
const notificationRoutes = require('./routes/notification');
const settingsRoutes = require('./routes/settings');
const auditRoutes = require('./routes/audit');
const studentRoutes = require('./routes/student');
const feesRoutes = require('./routes/fees');
const penaltyRoutes = require('./routes/penalty-config');
const reportRoutes = require('./routes/report');
const attendanceRoutes = require('./routes/attendance');
const timetableRoutes = require('./routes/timetable');
const hallRoutes = require('./routes/hall');
const leaveRoutes = require('./routes/leave');
const classSessionRoutes = require('./routes/classSession');
const attendanceSettingsRoutes = require('./routes/attendanceSettings');
const testCameraRoutes = require('./routes/testCamera');
const hdfcRoutes = require('./routes/hdfc');
const razorpayRoutes = require('./routes/razorpay');
const adminRoutes = require('./routes/admin');
const employeeRoutes = require('./routes/employee');
const dashboardRoutes = require('./routes/dashboard');
const bulkUploadRoutes = require('./routes/bulkUpload');
const internalSubjectRoutes = require('./routes/internalSubject');
const internalMarksRoutes = require('./routes/internalMarks');
const achievementRoutes = require('./routes/achievements');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/fee-heads', feeHeadRoutes);
app.use('/api/fee-plans', feePlanRoutes);
app.use('/api/quota-configs', quotaConfigRoutes);
app.use('/api/installment-schedules', installmentScheduleRoutes);
app.use('/api/invoices', invoiceRoutes);
// Mount specific payment providers before the generic payments router
app.use('/api/payments/razorpay', razorpayRoutes);
app.use('/api/payments/hdfc', hdfcRoutes);
// Generic payments router (list/create etc.)
app.use('/api/payments', paymentRoutes);
app.use('/api/receipts', require('./routes/receipt'));
app.use('/api/refunds', refundRoutes);
app.use('/api/concessions', concessionRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/penalty-config', penaltyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/sessions', classSessionRoutes);
app.use('/api/attendance-settings', attendanceSettingsRoutes);
app.use('/api/test-camera', testCameraRoutes); // Test camera data generation (dev only)
app.use('/admin', adminRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bulk-upload', bulkUploadRoutes);
app.use('/api/internal-subjects', internalSubjectRoutes);
app.use('/api/internal-marks', internalMarksRoutes);
app.use('/api/achievements', achievementRoutes);

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Export app to allow in-process testing; only listen if this file is executed directly
if (require.main === module) {
  const http = require('http');
  const server = http.createServer(app);
  
  // Initialize Socket.IO
  const { initSocket } = require('./config/socket');
  initSocket(server);
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO enabled for real-time updates`);
  });
}

module.exports = app;
