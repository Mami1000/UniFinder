import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { LoginRequest } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  message: string | null = null;
  hidePassword: boolean = true; // Управление видимостью пароля

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,  // Сервис для выполнения логина через JWT
    private router: Router,  
    private zone: NgZone     
  ) {
    // Обновленная форма: используем поле "login" вместо "email"
    this.loginForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // На странице логина сбрасываем любой пользовательский размер,
    // чтобы вход осуществлялся по стандартному размеру.
    document.documentElement.style.removeProperty('--base-font-size');
  }

  // Функция для установки сохранённого размера шрифта (если он имеется)
  private loadUserFont(): void {
    const storedFontSize = localStorage.getItem('fontSize');
    if (storedFontSize) {
      document.documentElement.style.setProperty('--base-font-size', storedFontSize + 'px');
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const payload: LoginRequest = this.loginForm.value;
      this.authService.login(payload).subscribe({
        next: (res) => {
          this.message = res.message;
          // После успешного логина подгружаем сохранённый размер шрифта
          this.loadUserFont();
          // Перенаправляем пользователя в защищённый раздел
          this.zone.run(() => {
            this.router.navigate(['/test/list']).then((navigated) => {
            }).catch(err => {
              // console.error('Ошибка при редиректе:', err);
            });
          });
        },
        error: (err) => {
          this.message = err.error?.message || 'Ошибка аутентификации';
          console.error('Ошибка входа:', err);
        }
      });
    }
  }

  // Метод для переключения видимости пароля
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  // Метод для редиректа на форму восстановления пароля
  redirectToForgotPassword(): void {
    this.router.navigate(['/forgot-password']).catch(err => {
      console.error('Ошибка редиректа на форму сброса пароля:', err);
    });
  }

  // Метод для редиректа на форму регистрации
  redirectToRegister(): void {
    this.router.navigate(['/register']).catch(err => {
      console.error('Ошибка редиректа на страницу регистрации:', err);
    });
  }
}
