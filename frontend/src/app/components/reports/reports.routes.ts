// src/app/components/reports/reports.routes.ts
import { Routes } from '@angular/router';
import { ReportsHubComponent } from './reports-hub/reports-hub.component';
import { FeesReportsComponent } from './fees-reports/fees-reports.component';
import { AttendanceReportsComponent } from './attendance-reports/attendance-reports.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => Promise.resolve(ReportsHubComponent),
    children: [
      { path: 'fees', loadComponent: () => Promise.resolve(FeesReportsComponent) },
      { path: 'attendance', loadComponent: () => Promise.resolve(AttendanceReportsComponent) }
    ]
  }
];