import { Routes } from '@angular/router';
import { AuthGuard, GuestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(c => c.LoginComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(c => c.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(c => c.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'students',
    loadChildren: () => import('./components/students/students.routes').then(r => r.routes),
    canActivate: [AuthGuard]
  },
  {
    path: 'employees',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/employees/employee-list/employee-list.component').then(c => c.EmployeeListComponent)
      },
      {
        path: 'add',
        loadComponent: () => import('./components/employees/employee-form/employee-form.component').then(c => c.EmployeeFormComponent)
      },
      {
        path: 'view/:id',
        loadComponent: () => import('./components/employees/employee-detail/employee-detail.component').then(c => c.EmployeeDetailComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./components/employees/employee-form/employee-form.component').then(c => c.EmployeeFormComponent)
      }
    ]
  },
  {
    path: 'fees',
    loadChildren: () => import('./components/fees/fees.routes').then(r => r.routes),
    canActivate: [AuthGuard]
  },
  {
    path: 'internal-marks',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'subjects',
        loadComponent: () => import('./components/internal-marks/subject-master.component').then(c => c.SubjectMasterComponent)
      }
    ]
  },
  {
    path: 'achievements',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'approvals',
        loadComponent: () => import('./components/achievements/achievement-approvals/achievement-approvals.component').then(c => c.AchievementApprovalsComponent)
      }
    ]
  },
  // {
  //   path: 'attendance',
  //   loadChildren: () => import('./components/attendance/attendance.routes').then(r => r.routes),
  //   canActivate: [AuthGuard]
  // },
  {
    path: 'attendance',
    loadChildren: () => import('./components/attendance/attendance.routes').then(r => r.routes),
    canActivate: [AuthGuard]
  },
  {
    path: 'leave',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'management',
        loadComponent: () => import('./components/leave/leave-management/leave-management.component').then(c => c.LeaveManagementComponent)
      }
    ]
  },
  {
    path: 'reports',
    loadChildren: () => import('./components/reports/reports.routes').then(r => r.routes),
    canActivate: [AuthGuard]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./components/unauthorized/unauthorized.component').then(c => c.UnauthorizedComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./components/not-found/not-found.component').then(c => c.NotFoundComponent)
  }
];
