// src/app/core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * HTTP Interceptor to automatically attach JWT token to requests
 * and handle token expiration
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ✅ Get token from AuthService using the getToken() method
    const token = this.authService.getToken();
    
    console.log(`🔗 [INTERCEPTOR] Intercepting request to: ${req.url}`);
    console.log(`🔗 [INTERCEPTOR] Token available: ${!!token}`);

    // Clone request and add authorization header if token exists
    if (token) {
      console.log(`🔗 [INTERCEPTOR] Adding Bearer token to request`);
      console.log(`🔗 [INTERCEPTOR] Token preview: ${token.substring(0, 50)}...`);
      
      req = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      
      console.log(`✅ [INTERCEPTOR] Authorization header added`);
    } else {
      console.warn(`⚠️ [INTERCEPTOR] No token available for request to: ${req.url}`);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`❌ [INTERCEPTOR] Error on ${req.url}:`, error.status, error.message);
        
        // Handle 401 Unauthorized - token expired or invalid
        if (error.status === 401) {
          console.error(`❌ [INTERCEPTOR] 401 Unauthorized - token is invalid`);
          // Don't logout here - let ErrorInterceptor handle it
        }

        // Handle 403 Forbidden
        if (error.status === 403) {
          console.error('❌ [INTERCEPTOR] 403 Forbidden:', error);
        }

        return throwError(() => error);
      })
    );
  }
}