import { Component, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule   // Для использования routerLink
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  message: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private zone: NgZone
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      // Извлекаем email из формы:
      const { email } = this.forgotPasswordForm.value;
      // Передаём email в сервис, а не весь объект payload
      this.authService.forgotPassword(email).subscribe({
        next: (res: any) => {
          this.message =
            res.message || 'На вашу почту отправлено письмо со ссылкой для сброса пароля.';
          this.isLoading = false;
          this.zone.run(() => {
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 1500);
          });
        },
        error: (err: any) => {
          this.message =
            err.error?.message || 'Ошибка при отправке запроса на сброс пароля';
          console.error('Ошибка сброса пароля:', err);
          this.isLoading = false;
        }
      });
    }
  }
}
