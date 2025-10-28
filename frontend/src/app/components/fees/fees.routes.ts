// src/app/components/fees/fees.routes.ts
import { Routes } from '@angular/router';
import { FeesGuard } from '../../guards/fees.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [FeesGuard],
    loadComponent: () => import('./fee-dashboard/fee-dashboard.component').then(c => c.FeeDashboardComponent)
  },
  {
    path: 'structure',
    canActivate: [FeesGuard],
    loadComponent: () => import('./fee-structure/fee-structure.component').then(c => c.FeeStructureComponent)
  },
  {
    path: 'collection',
    canActivate: [FeesGuard],
    loadComponent: () => import('./fee-collection/fee-collection.component').then(c => c.FeeCollectionComponent)
  },
  {
    path: 'bulk-upload',
    canActivate: [FeesGuard],
    loadComponent: () => import('./bulk-fee-upload/bulk-fee-upload.component').then(c => c.BulkFeeUploadComponent)
  },
  {
    path: 'payments',
    canActivate: [FeesGuard],
    loadComponent: () => import('./payment-history/payment-history.component').then(c => c.PaymentHistoryComponent)
  },
  {
    path: 'reports',
    canActivate: [FeesGuard],
    loadComponent: () => import('./fee-reports-enhanced/fee-reports-enhanced.component').then(c => c.FeeReportsEnhancedComponent)
  },
  {
    path: 'student/:id',
    canActivate: [FeesGuard],
    loadComponent: () => import('./student-fees/student-fees.component').then(c => c.StudentFeesComponent)
  },
  {
    path: 'student-fee-view/:id',
    canActivate: [FeesGuard],
    loadComponent: () => import('./student-fee-view/student-fee-view.component').then(c => c.StudentFeeViewComponent)
  },
  {
    path: 'pay-fees/:id',
    canActivate: [FeesGuard],
    loadComponent: () => import('./pay-fees/pay-fees.component').then(c => c.PayFeesComponent)
  },
  {
    path: 'student-reports/:id',
    canActivate: [FeesGuard],
    loadComponent: () => import('./student-fee-reports/student-fee-reports.component').then(c => c.StudentFeeReportsComponent)
  },
  {
    path: 'structures',
    canActivate: [FeesGuard],
    loadComponent: () => import('./fee-structure-list/fee-structure-list.component').then(c => c.FeeStructureListComponent)
  },
  {
    path: 'fee-structure/create',
    canActivate: [FeesGuard],
    loadComponent: () => import('./fee-structure-form/fee-structure-form.component').then(c => c.FeeStructureFormComponent)
  },
  {
    path: 'fee-structure/edit/:id',
    canActivate: [FeesGuard],
    loadComponent: () => import('./fee-structure-form/fee-structure-form.component').then(c => c.FeeStructureFormComponent)
  },
  {
    path: 'master/fee-heads',
    canActivate: [FeesGuard],
    loadComponent: () => import('./fee-head-list/fee-head-list.component').then(c => c.FeeHeadListComponent)
  },
  {
    path: 'master/fee-head/create',
    canActivate: [FeesGuard],
    loadComponent: () => import('./fee-head-form/fee-head-form.component').then(c => c.FeeHeadFormComponent)
  },
  {
    path: 'master/fee-head/edit/:id',
    canActivate: [FeesGuard],
    loadComponent: () => import('./fee-head-form/fee-head-form.component').then(c => c.FeeHeadFormComponent)
  },
  {
    path: 'master/quotas',
    canActivate: [FeesGuard],
    loadComponent: () => import('./quota-list/quota-list.component').then(c => c.QuotaListComponent)
  },
  {
    path: 'master/quota/create',
    canActivate: [FeesGuard],
    loadComponent: () => import('./quota-form/quota-form.component').then(c => c.QuotaFormComponent)
  },
  {
    path: 'master/quota/edit/:id',
    canActivate: [FeesGuard],
    loadComponent: () => import('./quota-form/quota-form.component').then(c => c.QuotaFormComponent)
  }
];