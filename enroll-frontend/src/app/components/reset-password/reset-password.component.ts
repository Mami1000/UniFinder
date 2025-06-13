import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';  // Импорт иконок

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,  // Для работы директив formGroup и formControlName
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule  // Добавляем модуль для Material Icons
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  token: string | null = null;
  message: string = "";
  isLoading = false;
  isValidToken = false;
  hidePassword: boolean = true; // Флаг для переключения видимости пароля

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || null;
      if (this.token) {
        this.authService.verifyToken(this.token).subscribe({
          next: () => {
            this.isValidToken = true;
          },
          error: () => {
            this.isValidToken = false;
          }
        });
      }
    });
  }

  // Метод для переключения видимости пароля
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.token) {
      this.message = 'Пожалуйста, введите новый пароль и убедитесь, что токен корректный.';
      return;
    }
    this.isLoading = true;
    const newPassword = this.resetPasswordForm.get('newPassword')?.value;
    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: (res: any) => {
        this.message = res?.message || 'Пароль успешно обновлён.';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err: any) => {
        this.message = err.error?.message || 'Ошибка при обновлении пароля.';
        this.isLoading = false;
      }
    });
  }
}
