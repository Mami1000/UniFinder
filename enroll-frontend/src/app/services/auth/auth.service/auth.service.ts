// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
// Предполагаем, что DTO перенесены в отдельный модуль или остаются там, где они есть
import { UserService, RegisterRequest, LoginRequest } from '../../user/user.service';
export interface User {
  id: string;
  name: string;
  role: string;
  // Дополнительно можно добавить email, photoURL и прочее — в зависимости от того, что требуется
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  // Изменили базовый URL для обращения к Auth контроллеру
  private apiUrl = `${environment.apiBaseUrl}/api/auth`;

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    this.isLoggedInSubject.next(!!token);
  }

login(loginRequest: LoginRequest): Observable<any> {
  return this.http.post(`${this.apiUrl}/login`, loginRequest).pipe(
    tap((response: any) => {
      // Ожидаем, что сервер вернет { token, refreshToken, user }
      if (response.token && response.refreshToken) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken); //  сохраняем refreshToken
        localStorage.setItem('user', JSON.stringify(response.user));
        this.isLoggedInSubject.next(true);
      } else {
        console.warn('Не получен токен при логине');
      }
    })
  );
}

register(registerRequest: RegisterRequest): Observable<any> {
  return this.http.post(`${this.apiUrl}/register`, registerRequest).pipe(
    tap((response: any) => {
      if (response.token && response.refreshToken) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken); //  сохраняем refreshToken
        localStorage.setItem('user', JSON.stringify(response.user));
        this.isLoggedInSubject.next(true);
      } else {
        console.warn('Не получен токен при регистрации');
      }
    })
  );
}

logout(): void {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user?.id) {
    this.http.post(`${this.apiUrl}/logout`, { userId: user.id }, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: () => console.log('Серверный logout выполнен'),
      error: (err) => console.warn('Ошибка logout на сервере', err)
    });
  }

  // Чистим клиент
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  this.isLoggedInSubject.next(false);
}


refreshToken(): Observable<{ token: string }> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('Refresh token не найден');
  }

  return this.http.post<{ token: string, refreshToken: string }>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
    tap((response) => {
      // Обновляем токены
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
    })
  );
}
  // Получение данных текущего пользователя из localStorage
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      return null;
    }
    try {
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error('Ошибка парсинга данных пользователя', error);
      return null;
    }
  }

  // Метод для получения ID текущего пользователя
  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  // Метод для получения роли пользователя
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  // Метод запроса сброса пароля
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgotpassword`, { email });
  }
  
  // Метод сброса пароля с помощью токена
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resetpassword`, { token, newPassword });
  }

  // Метод проверки валидности токена
  verifyToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verifytoken?token=${token}`);
  }
}
