// src/app/components/students/students.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./student-list/student-list.component').then(c => c.StudentListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./student-form/student-form.component').then(c => c.StudentFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./student-detail/student-detail.component').then(c => c.StudentDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./student-form/student-form.component').then(c => c.StudentFormComponent)
  }
];