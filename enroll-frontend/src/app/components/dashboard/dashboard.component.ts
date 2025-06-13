import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService, User } from '../../services/user/user.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MediaService } from '../../services/media/media.service'; // Импортируем MediaService

@Component({
  selector: 'app-dashboard',
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
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  profileForm!: FormGroup;
  previewPhoto: string | null = null;
  message: string | null = null;
  currentUser!: User;
  selectedPhotoFile: File | null = null;
  // Флаг, который блокирует повторные отправки, пока предыдущий запрос не завершен.
  isProcessing: boolean = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private mediaService: MediaService  // Внедряем MediaService
  ) {}

  ngOnInit(): void {
    const user = this.userService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = user;
  
    this.profileForm = this.fb.group({
      name: [this.currentUser.name, Validators.required],
      email: [{ value: this.currentUser.email, disabled: true }],
      password: ['', Validators.minLength(6)]
    });
  
    if (this.currentUser.photoURL) {
      this.loadPreviewPhoto(this.currentUser.photoURL); // имя файла
    }
  }
  
  loadPreviewPhoto(file: Blob | string): void {
    if (typeof file === 'string') {
      // Если файл начинается с "assets/", используем его напрямую
      if (file.startsWith('assets/')) {
        this.previewPhoto = file;
        return;
      }
      // Иначе обращаться к серверу для дешифровки
      this.userService.loadPhoto(file).subscribe({
        next: (blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            this.previewPhoto = reader.result as string;
          };
          reader.readAsDataURL(blob);
        },
        error: () => {
          this.message = 'Ошибка загрузки аватара с сервера.';
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewPhoto = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
  
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.message = 'Допускаются только форматы JPG и PNG!';
      return;
    }
  
    this.selectedPhotoFile = file;
  
    const reader = new FileReader();
    reader.onload = () => {
      this.previewPhoto = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) {
      this.message = 'Пожалуйста, исправьте ошибки в форме.';
      return;
    }
    
    // Блокируем повторное обновление, пока не завершится текущий запрос.
    if (this.isProcessing) {
      this.message = 'Обработка запроса, пожалуйста, подождите...';
      return;
    }
    this.isProcessing = true;

    const updatedUser: User = {
      ...this.currentUser,
      name: this.profileForm.get('name')?.value,
      password: this.profileForm.get('password')?.value || undefined
    };

    const saveUser = () => {
      this.userService.update(updatedUser).subscribe({
        next: (res) => {
          localStorage.setItem('user', JSON.stringify(res.user));
          this.currentUser = res.user;
          this.profileForm.get('password')?.reset();
          this.message = 'Профиль успешно обновлён!';
          this.isProcessing = false;
        },
        error: () => {
          this.message = 'Ошибка обновления профиля.';
          this.isProcessing = false;
        }
      });
    };

    if (this.selectedPhotoFile) {
      // Вместо userService.uploadPhoto вызываем mediaService.uploadUserPhoto
      this.mediaService.uploadUserPhoto(this.selectedPhotoFile).subscribe({
        next: (res) => {
          updatedUser.photoURL = res.fileName;
          saveUser();
        },
        error: (err) => {
          if (err.error && err.error.message === 'Файл с таким содержимым уже загружен.') {
            this.message = 'Такой файл уже загружен, выберите другой.';
          } else {
            this.message = 'Ошибка загрузки изображения.';
          }
          this.isProcessing = false;
        }
      });
      return;
   }
   
  
    updatedUser.photoURL = this.currentUser.photoURL;
    saveUser();
  }
  
  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
