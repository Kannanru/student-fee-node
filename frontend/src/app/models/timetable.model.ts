// src/app/models/timetable.model.ts
export interface Timetable {
  _id: string;
  className: string;
  room: string;
  programName: string;
  academicYear: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
  startTime: string;
  endTime: string;
  studentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TimetableRequest {
  className: string;
  room: string;
  programName: string;
  academicYear: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  studentIds: string[];
}

export interface TimetableQuery {
  programName?: string;
  academicYear?: string;
  dayOfWeek?: number;
}