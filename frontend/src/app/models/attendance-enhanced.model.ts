export interface Hall {
  _id?: string;
  hallId: string;
  hallName: string;
  type: 'Lecture' | 'Seminar' | 'Lab' | 'Auditorium';
  capacity: number;
  deviceId?: string;
  cameraId: string;
  location?: string;
  building?: string;
  floor?: string;
  cameraStatus: 'Online' | 'Offline' | 'Maintenance' | 'Error';
  lastHealthCheck?: Date;
  recognitionAccuracy?: number;
  configuration?: {
    minConfidence: number;
    maxSpoofScore: number;
    bufferHours: number;
  };
  isActive: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClassSession {
  _id?: string;
  timetableId: string;
  hallId: string;
  hall?: Hall;
  date: Date;
  periodNumber: number;
  subject: string;
  facultyId?: string;
  facultyName?: string;
  program: string;
  department?: string;
  year: number;
  semester: number;
  startTime: Date;
  endTime: Date;
  duration: number;
  expectedStudents?: string[];
  totalExpected: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
  cancellationReason?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AttendanceEvent {
  _id?: string;
  studentId: string;
  studentRegNo: string;
  hallId: string;
  sessionId?: string;
  timestamp: Date;
  direction: 'IN' | 'OUT';
  confidence: number;
  spoofScore: number;
  deviceId?: string;
  cameraId: string;
  imageUrl?: string;
  processingStatus: 'Pending' | 'Processed' | 'Rejected' | 'Exception';
  rejectionReason?: string;
  attendanceRecordId?: string;
  metadata?: any;
  isProcessed: boolean;
  processedAt?: Date;
  notes?: string;
  createdAt?: Date;
}

export interface AttendanceSettings {
  _id?: string;
  department: string;
  program?: string;
  year?: number;
  semester?: number;
  gracePeriodMinutes: number;
  presenceThresholdPercent: number;
  lateThresholdMinutes: number;
  absentThresholdPercent: number;
  cameraSettings: {
    minConfidence: number;
    maxSpoofScore: number;
    requireLiveness: boolean;
    allowMask: boolean;
    duplicateEventWindowSeconds: number;
  };
  calculationRules: {
    weekendCounting: boolean;
    holidaysCounting: boolean;
    minimumAttendancePercent: number;
    attendanceShortfallAction: string;
  };
  notificationSettings: {
    alertOnAbsent: boolean;
    alertOnLate: boolean;
    alertThresholdPercent: number;
    notifyParents: boolean;
    notifyStudent: boolean;
    notifyFaculty: boolean;
  };
  overridePermissions: {
    facultyCanOverride: boolean;
    proctorCanOverride: boolean;
    requireApproval: boolean;
    maxOverridesPerDay: number;
  };
  isActive: boolean;
  priority: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EnhancedTimetable {
  _id?: string;
  className: string;
  subject: string;
  room?: string;
  hallId?: string;
  hall?: Hall;
  programName: string;
  department?: string;
  year: number;
  semester: number;
  periodNumber: number;
  academicYear: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  instructor?: string;
  facultyId?: string;
  facultyName?: string;
  capacity?: number;
  studentIds?: string[];
  isActive: boolean;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
