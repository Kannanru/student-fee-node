// config/socket.js
// Socket.IO Configuration for Real-time Attendance Updates

const socketIO = require('socket.io');

let io;

/**
 * Initialize Socket.IO server
 * @param {Object} server - HTTP server instance
 */
function initSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: ['http://localhost:4200', 'http://localhost:5000'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log(`✅ New client connected: ${socket.id}`);

    // Join rooms for specific data streams
    socket.on('join:attendance', (data) => {
      socket.join('attendance-stream');
      console.log(`Client ${socket.id} joined attendance stream`);
    });

    socket.on('join:dashboard', (data) => {
      socket.join('admin-dashboard');
      console.log(`Client ${socket.id} joined admin dashboard`);
    });

    socket.on('join:hall', (hallId) => {
      socket.join(`hall:${hallId}`);
      console.log(`Client ${socket.id} joined hall: ${hallId}`);
    });

    socket.on('join:session', (sessionId) => {
      socket.join(`session:${sessionId}`);
      console.log(`Client ${socket.id} joined session: ${sessionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  console.log('🔌 Socket.IO server initialized');
  return io;
}

/**
 * Get Socket.IO instance
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSocket first.');
  }
  return io;
}

/**
 * Emit attendance event to all connected clients
 */
function emitAttendanceEvent(eventData) {
  if (io) {
    io.to('attendance-stream').emit('attendance:new', eventData);
    io.to('admin-dashboard').emit('dashboard:update', {
      type: 'attendance',
      data: eventData,
      timestamp: new Date()
    });
    console.log(`📡 Emitted attendance event: ${eventData.studentName} - ${eventData.direction}`);
  }
}

/**
 * Emit hall-specific event
 */
function emitHallEvent(hallId, eventData) {
  if (io) {
    io.to(`hall:${hallId}`).emit('hall:event', eventData);
    console.log(`📡 Emitted hall event for ${hallId}`);
  }
}

/**
 * Emit session update
 */
function emitSessionUpdate(sessionId, updateData) {
  if (io) {
    io.to(`session:${sessionId}`).emit('session:update', updateData);
    io.to('admin-dashboard').emit('dashboard:update', {
      type: 'session',
      data: updateData,
      timestamp: new Date()
    });
    console.log(`📡 Emitted session update for ${sessionId}`);
  }
}

/**
 * Emit camera status change
 */
function emitCameraStatus(cameraId, status) {
  if (io) {
    io.to('admin-dashboard').emit('camera:status', {
      cameraId,
      status,
      timestamp: new Date()
    });
    console.log(`📡 Camera status update: ${cameraId} - ${status}`);
  }
}

/**
 * Emit exception/rejected event
 */
function emitException(exceptionData) {
  if (io) {
    io.to('admin-dashboard').emit('attendance:exception', exceptionData);
    console.log(`⚠️ Emitted exception: ${exceptionData.reason}`);
  }
}

/**
 * Broadcast system notification
 */
function broadcastNotification(message, type = 'info') {
  if (io) {
    io.emit('system:notification', {
      message,
      type,
      timestamp: new Date()
    });
  }
}

module.exports = {
  initSocket,
  getIO,
  emitAttendanceEvent,
  emitHallEvent,
  emitSessionUpdate,
  emitCameraStatus,
  emitException,
  broadcastNotification
};
