// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse, User, UpdateProfileRequest } from '../models/auth.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('currentUser');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuth();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', credentials).pipe(
      tap(response => {
        if (response.success) {
          this.setAuth(response.token, response.user);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.apiService.post('/auth/register', userData);
  }

  getProfile(): Observable<{ success: boolean; user: User }> {
    return this.apiService.get<{ success: boolean; user: User }>('/auth/profile').pipe(
      tap(response => {
        if (response.success) {
          this.currentUserSubject.next(response.user);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }
      })
    );
  }

  updateProfile(profileData: UpdateProfileRequest): Observable<{ success: boolean; message: string; user: User }> {
    return this.apiService.put<{ success: boolean; message: string; user: User }>('/auth/profile', profileData).pipe(
      tap(response => {
        if (response.success) {
          this.currentUserSubject.next(response.user);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }
      })
    );
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  private setAuth(token: string, user: User): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuth(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  hasRole(role: string): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }
}