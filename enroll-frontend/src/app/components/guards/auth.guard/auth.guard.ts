import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service/auth.service';
import { take, map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
// AuthGuard проверяет, авторизован ли пользователь перед доступом к защищенным маршрутам
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) { }

  canActivate(): Observable<boolean> {
    return this.authService.isLoggedIn$.pipe(
      take(1),
      map(loggedIn => {
        if (loggedIn) return true;
        this.router.navigate(['/login']);
        return false;
      })
    );
  }

}
