import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiResponse, LoginRequest, LoginResponse, User } from '../models/api-response.model';
import { ToastService } from './toast.service';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.token());
  readonly user = computed(() => this.currentUser());

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.token.set(token);
      this.currentUser.set(JSON.parse(user));
    } else {
      // Development: Set mock auth data for testing all pages
      this.setMockAuth();
    }
  }

  private setMockAuth(): void {
    // Create mock tokens for development
    const mockToken = 'dev-token-' + Date.now();
    const mockUser: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
      phone: '0501234567'
    };
    
    this.token.set(mockToken);
    this.currentUser.set(mockUser);
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${environment.apiUrl}/Auth/login`,
      credentials
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          this.setAuthData(response.data);
          this.toast.showSuccess('Login successful!');
          return response.data;
        }
        throw new Error(response.message || 'Login failed');
      }),
      catchError(error => {
        this.toast.showError(error.error?.message || 'Login failed');
        return throwError(() => error);
      })
    );
  }

  registerCustomer(data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${environment.apiUrl}/Auth/register/customer`,
      data
    ).pipe(
      map(response => {
        if (response.success) {
          this.toast.showSuccess('Registration successful! Please login.');
          return response.data;
        }
        throw new Error(response.message || 'Registration failed');
      }),
      catchError(error => {
        this.toast.showError(error.error?.message || 'Registration failed');
        return throwError(() => error);
      })
    );
  }

  registerMerchant(data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${environment.apiUrl}/Auth/register/merchant`,
      data
    ).pipe(
      map(response => {
        if (response.success) {
          this.toast.showSuccess('Merchant registration successful!');
          return response.data;
        }
        throw new Error(response.message || 'Registration failed');
      }),
      catchError(error => {
        this.toast.showError(error.error?.message || 'Registration failed');
        return throwError(() => error);
      })
    );
  }

  private setAuthData(data: LoginResponse): void {
    this.token.set(data.token);
    this.currentUser.set(data.user);
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    this.router.navigate(['/auth/signin']);
    this.toast.showInfo('Logged out successfully');
  }

  getToken(): string | null {
    return this.token();
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role;
  }
}