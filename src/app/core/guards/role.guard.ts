import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    // Allow all access during development
    return true;
    
    // const user = this.authService.user();
    // const requiredRole = route.data['role'];
    // if (user && user.role === requiredRole) {
    //   return true;
    // }
    // this.router.navigate(['/']);
    // return false;
  }
}