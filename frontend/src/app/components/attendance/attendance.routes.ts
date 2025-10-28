// src/app/components/attendance/attendance.routes.ts
import { Routes } from '@angular/router';
import { AttendanceDashboardComponent } from './attendance-dashboard/attendance-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: AttendanceDashboardComponent
  },
  {
    path: 'dashboard',
    component: AttendanceDashboardComponent
  },
  {
    path: 'halls',
    loadComponent: () => import('./hall-management/hall-management.component').then(m => m.HallManagementComponent)
  },
  {
    path: 'timetable',
    loadComponent: () => import('./timetable-master/timetable-master.component').then(m => m.TimetableMasterComponent)
  },
  {
    path: 'timetable-master',
    loadComponent: () => import('./timetable-master/timetable-master.component').then(m => m.TimetableMasterComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./attendance-reports-enhanced/attendance-reports-enhanced.component').then(m => m.AttendanceReportsEnhancedComponent)
  },
  {
    path: 'realtime',
    loadComponent: () => import('./realtime-dashboard/realtime-dashboard.component').then(m => m.RealtimeDashboardComponent)
  }
];
