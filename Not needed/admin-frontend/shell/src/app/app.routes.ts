import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login';

export const routes: Routes = [
  { path: 'auth', component: LoginComponent },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  // Add other standalone routes here
];
