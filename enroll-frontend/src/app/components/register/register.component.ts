import { Component, OnInit, AfterViewInit, NgZone, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { FirebaseApp } from '@angular/fire/app';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth/auth.service/auth.service';
import { RegisterRequest } from '../../services/user/user.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, AfterViewInit {
  // Форма регистрации, добавили поле confirmPassword
  registerForm: FormGroup;
  // Форма для ввода кода подтверждения SMS
  codeForm: FormGroup;
  // Флаг, что код отправлен
  codeSent: boolean = false;
  message: string | null = null;
  confirmationResult: any;
  recaptchaVerifier!: RecaptchaVerifier;
  
  // Флаги для переключения видимости полей
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  
  // Получаем firebaseApp через DI
  private app: FirebaseApp = inject(FirebaseApp);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private zone: NgZone
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      surname: [''], // поле фамилии теперь не обязательно
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      phoneNumber: ['', Validators.required]
    }, { validators: passwordMatchValidator });
    

    this.codeForm = this.fb.group({
      verificationCode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const auth = getAuth(this.app);
    console.log('Firebase App:', this.app);
    console.log('Auth:', auth);
  }

  ngAfterViewInit(): void {
    const auth = getAuth(this.app);
    const container = document.getElementById('recaptcha-container');
    if (!container) {
      console.error("Элемент с id 'recaptcha-container' не найден в AfterViewInit");
      return;
    }
    // Правильный порядок: сначала контейнер, затем настройки, затем auth
    this.recaptchaVerifier = new RecaptchaVerifier(
      container,
      {
        size: 'invisible',
        callback: (response: any) => {
          console.log('reCAPTCHA пройдена успешно, ответ:', response);
        }
      },
      auth
    );
  }
  sendVerificationCode(): void {
    if (this.registerForm.invalid) {
      this.message = 'Пожалуйста, заполните все поля правильно!';
      return;
    }
    const phoneNumber = this.registerForm.value.phoneNumber;
    const auth = getAuth(this.app);
    signInWithPhoneNumber(auth, phoneNumber, this.recaptchaVerifier)
      .then((confirmationResult) => {
        this.confirmationResult = confirmationResult;
        this.codeSent = true;
        this.message = 'Код отправлен. Проверьте SMS.';
      })
      .catch((error) => {
        console.error('Ошибка отправки кода:', error);
        this.message = 'Ошибка отправки кода: ' + error.message;
      });
  }

  verifyCode(): void {
    const code = this.codeForm.value.verificationCode;
    if (!code) {
      this.message = 'Введите код подтверждения';
      return;
    }
    if (!this.confirmationResult) {
      this.message = 'Сначала отправьте код подтверждения';
      return;
    }
    this.confirmationResult.confirm(code)
      .then((result: any) => {
        const uid = result.user.uid;
        const registerData: RegisterRequest & { uid: string; userpoint: number } = {
          ...this.registerForm.value,
          uid: uid,            
          userpoint: 0         
        };
        
        this.authService.register(registerData).subscribe({
          next: (res) => {
            console.log('Пользователь зарегистрирован на сервере:', res);
            localStorage.setItem('user', JSON.stringify(registerData));
            this.message = 'Регистрация прошла успешно!';
            this.zone.run(() => {
              this.router.navigate(['/login']);
            });
          },
          error: (err) => {
            console.error('Ошибка регистрации на сервере:', err);
            this.message = 'Ошибка регистрации на сервере: ' + err.message;
          }
        });
      })
      .catch((error: any) => {
        console.error('Ошибка верификации кода:', error);
        this.message = 'Неверный код. Регистрация не выполнена.';
      });
  }

  // Переключение видимости для поля пароля
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  // Переключение видимости для поля подтверждения пароля
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  // Метод для редиректа к форме входа
  redirectToLogin(): void {
    this.router.navigate(['/login'])
      .catch(err => console.error('Ошибка редиректа на страницу входа:', err));
  }
}

// Кастомный валидатор для проверки совпадения пароля и подтверждения пароля
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value !== confirmPassword.value
    ? { 'passwordMismatch': true }
    : null;
};
