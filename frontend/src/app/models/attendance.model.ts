// src/app/models/attendance.model.ts
export interface AttendanceRecord {
  _id: string;
  studentId: string;
  className: string;
  date: string;
  classStartTime: string;
  classEndTime: string;
  timeIn?: string;
  timeOut?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Partial';
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRequest {
  studentId: string;
  className: string;
  date: string;
  classStartTime: string;
  classEndTime: string;
  timeIn?: string;
  timeOut?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Partial';
}

export interface StudentDailyAttendance {
  date: string;
  records: AttendanceRecord[];
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
}

export interface StudentAttendanceSummary {
  studentId: string;
  startDate: string;
  endDate: string;
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  lateClasses: number;
  attendancePercentage: number;
  records: AttendanceRecord[];
}

export interface AdminDailyReport {
  date: string;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  lateStudents: number;
  attendancePercentage: number;
  classWiseData: ClassAttendanceData[];
}

export interface ClassAttendanceData {
  className: string;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  attendancePercentage: number;
}

export interface OccupancyData {
  date: string;
  classRooms: {
    [roomName: string]: {
      totalCapacity: number;
      currentOccupancy: number;
      occupancyPercentage: number;
    };
  };
}