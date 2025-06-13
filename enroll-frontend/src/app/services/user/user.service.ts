// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  login: string;    // Универсальное поле: может содержать email или номер телефона
  password: string;
}

export interface RegisterRequest {
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;  // Новое поле для номера телефона
  password: string;
}

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  role: string;
  userpoint: number;
  photoURL?: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  message: string;
  token: string;   // JWT-токен, возвращаемый сервером при успешном входе
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // URL для операций, связанных с данными пользователя (например, обновления профиля)
  private userUrl = `${environment.apiBaseUrl}/api/user`;
  private authUrl = `${environment.apiBaseUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  // Методы аутентификации – теперь через контроллер Auth:
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, request);
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, request);
  }

  forgotPassword(payload: { email: string }): Observable<any> {
    return this.http.post(`${this.authUrl}/forgotpassword`, payload);
  }


  // Остальные методы для работы с данными пользователя:
  update(profile: User): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.userUrl}/update`, profile);
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user');
    if (!userData) {
      return null;
    }
    const user = JSON.parse(userData);
    // Если сервер возвращает идентификатор как _id, переназначаем его в id
    if (user._id && !user.id) {
      user.id = user._id;
    }
    return user as User;
  }

  isCurrentUserAdmin(): boolean {
  return this.getCurrentUser()?.role === 'admin'; 
}


uploadPhoto(file: File): Observable<{ fileName: string }> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post<{ fileName: string }>(
    `${environment.apiBaseUrl}/api/media/upload-photo`,
    formData
  );
}

loadPhoto(fileName: string): Observable<Blob> {
  return this.http.get(
    `${environment.apiBaseUrl}/api/media/decrypt-photo?fileName=${fileName}`,
    { responseType: 'blob' }
  );
}
  
  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
}
