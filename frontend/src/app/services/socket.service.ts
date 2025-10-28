// src/app/services/socket.service.ts
// Real-time Socket.IO Service for Attendance Updates

import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface AttendanceEventData {
  type: string;
  student?: {
    id: string;
    name: string;
    program?: string;
    year?: number;
    semester?: number;
  };
  hall?: {
    id: string;
    name: string;
  };
  session?: {
    id: string;
    subject: string;
    periodNumber: number;
  };
  direction?: string;
  status?: string;
  timestamp: Date;
  confidence?: number;
}

export interface DashboardUpdate {
  type: string;
  data: any;
  timestamp: Date;
}

export interface CameraStatus {
  cameraId: string;
  status: string;
  timestamp: Date;
}

export interface ExceptionData {
  type: string;
  student?: any;
  hall?: any;
  confidence?: number;
  spoofScore?: number;
  reason: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;
  private serverUrl = 'http://localhost:5000'; // Use environment config later
  
  // Connection status
  public connected$ = new BehaviorSubject<boolean>(false);
  
  // Event subjects
  private attendanceEvents$ = new Subject<AttendanceEventData>();
  private dashboardUpdates$ = new Subject<DashboardUpdate>();
  private cameraStatus$ = new Subject<CameraStatus>();
  private exceptions$ = new Subject<ExceptionData>();
  private sessionUpdates$ = new Subject<any>();
  private notifications$ = new Subject<any>();

  constructor() {}

  /**
   * Connect to Socket.IO server
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.connected$.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.connected$.next(false);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      this.connected$.next(false);
    });

    // Listen to attendance events
    this.socket.on('attendance:new', (data: AttendanceEventData) => {
      console.log('📡 New attendance event:', data);
      this.attendanceEvents$.next(data);
    });

    // Listen to dashboard updates
    this.socket.on('dashboard:update', (data: DashboardUpdate) => {
      console.log('📊 Dashboard update:', data);
      this.dashboardUpdates$.next(data);
    });

    // Listen to camera status changes
    this.socket.on('camera:status', (data: CameraStatus) => {
      console.log('📹 Camera status update:', data);
      this.cameraStatus$.next(data);
    });

    // Listen to exceptions
    this.socket.on('attendance:exception', (data: ExceptionData) => {
      console.log('⚠️ Exception:', data);
      this.exceptions$.next(data);
    });

    // Listen to session updates
    this.socket.on('session:update', (data: any) => {
      console.log('📚 Session update:', data);
      this.sessionUpdates$.next(data);
    });

    // Listen to system notifications
    this.socket.on('system:notification', (data: any) => {
      console.log('🔔 Notification:', data);
      this.notifications$.next(data);
    });

    // Listen to hall events
    this.socket.on('hall:event', (data: any) => {
      console.log('🏛️ Hall event:', data);
      this.attendanceEvents$.next(data);
    });
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.connected$.next(false);
    }
  }

  /**
   * Join attendance stream room
   */
  joinAttendanceStream(): void {
    if (this.socket) {
      this.socket.emit('join:attendance', {});
      console.log('Joined attendance stream');
    }
  }

  /**
   * Join admin dashboard room
   */
  joinDashboard(): void {
    if (this.socket) {
      this.socket.emit('join:dashboard', {});
      console.log('Joined admin dashboard');
    }
  }

  /**
   * Join specific hall room
   */
  joinHall(hallId: string): void {
    if (this.socket) {
      this.socket.emit('join:hall', hallId);
      console.log('Joined hall:', hallId);
    }
  }

  /**
   * Join specific session room
   */
  joinSession(sessionId: string): void {
    if (this.socket) {
      this.socket.emit('join:session', sessionId);
      console.log('Joined session:', sessionId);
    }
  }

  /**
   * Get observable for attendance events
   */
  onAttendanceEvent(): Observable<AttendanceEventData> {
    return this.attendanceEvents$.asObservable();
  }

  /**
   * Get observable for dashboard updates
   */
  onDashboardUpdate(): Observable<DashboardUpdate> {
    return this.dashboardUpdates$.asObservable();
  }

  /**
   * Get observable for camera status
   */
  onCameraStatus(): Observable<CameraStatus> {
    return this.cameraStatus$.asObservable();
  }

  /**
   * Get observable for exceptions
   */
  onException(): Observable<ExceptionData> {
    return this.exceptions$.asObservable();
  }

  /**
   * Get observable for session updates
   */
  onSessionUpdate(): Observable<any> {
    return this.sessionUpdates$.asObservable();
  }

  /**
   * Get observable for notifications
   */
  onNotification(): Observable<any> {
    return this.notifications$.asObservable();
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}
