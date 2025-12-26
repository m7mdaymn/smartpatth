// src/app/core/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private toast: ToastService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';
        
        if (error.error instanceof ErrorEvent) {
          errorMessage = error.error.message;
        } else {
          errorMessage = error.error?.message || error.message;
          
          if (error.status === 401) {
            this.toast.showError('Session expired. Please login again.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            this.router.navigate(['/auth/signin']);
          } else if (error.status === 403) {
            this.toast.showError('You do not have permission to access this resource.');
          } else if (error.status >= 500) {
            this.toast.showError('Server error. Please try again later.');
          }
        }
        
        return throwError(() => error);
      })
    );
  }
}