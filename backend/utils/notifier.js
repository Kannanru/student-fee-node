let admin;
try {
  admin = require('firebase-admin');
  if (!admin.apps.length && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }
} catch (e) {
  admin = null;
}

async function notifyAttendanceAlert(payload) {
  try {
    if (!admin || !admin.messaging) return;
    const topic = process.env.FCM_TOPIC || 'attendance-alerts';
    await admin.messaging().send({
      topic,
      notification: {
        title: `${payload.type} - ${payload.className}`,
        body: `${payload.student.studentName} (${payload.student.studentId}) ${payload.type}${payload.type==='Late' ? ' by '+(payload.lateMinutes||0)+' min' : ''}`
      },
      data: {
        type: payload.type,
        className: payload.className,
        studentId: payload.student.studentId,
        academicYear: payload.student.academicYear || ''
      }
    });
  } catch {}
}

module.exports = { notifyAttendanceAlert };
