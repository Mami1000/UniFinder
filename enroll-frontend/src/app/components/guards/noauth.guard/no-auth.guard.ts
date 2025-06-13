import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

//Проверяем если пользователь зареган и вводит всякую хрень в маршрут(url) то его редиректит в test/list на главыный экран
@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('token');
    if (token) {
      return this.router.createUrlTree(['/test/list']);
    }
    return true;
  }
}
