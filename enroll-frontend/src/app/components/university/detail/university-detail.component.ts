import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { University, UniversityService } from '../../../services/university/university.service';
import { MediaService } from '../../../services/media/media.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user/user.service'; 

@Component({
  selector: 'app-university-detail',
  templateUrl: './university-detail.component.html',
  styleUrls: ['./university-detail.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UniversityDetailComponent implements OnInit {
  university: University | undefined;
  updatedUniversity: University = {
    name: '',
    location: '',
    description: '',
    logoUrl: '',
    courses: []
  };
  editMode = false;
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private universityService: UniversityService,
    private mediaService: MediaService,
    private userService: UserService 
  ) {}

  ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.universityService.getUniversityById(id).subscribe({
      next: (data) => this.university = data,
      error: (err) => console.error('Ошибка при загрузке университета:', err)
    });
  }
  const currentUser = this.userService.getCurrentUser();
  this.isAdmin = this.userService.isCurrentUserAdmin();
}

  // Формирование URL для логотипа
  getLogoUrl(fileName: string): string {
    return this.mediaService.getDecryptedPhotoUrl(fileName);
  }

  // Вернуться к списку
  goBack(): void {
    this.router.navigate(['/universities']);
  }

  // Включить режим редактирования
  enableEdit(): void {
    if (this.university) {
      this.updatedUniversity = { ...this.university };
      this.editMode = true;
    }
  }
  saveChanges(): void {
    if (!this.university?.id) return;

    this.universityService.updateUniversity(this.university.id, this.updatedUniversity).subscribe({
      next: (updated) => {
        this.university = updated;
        this.editMode = false;
      },
      error: (err) => console.error('Ошибка при сохранении:', err)
    });
  }

  // Загрузка и предпросмотр логотипа
  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      // Показываем превью
      const reader = new FileReader();
      reader.onload = () => {
        this.updatedUniversity.logoUrl = reader.result as string;
      };
      reader.readAsDataURL(file);

      // Отправляем файл на сервер
      this.mediaService.uploadUniversityLogo(file).subscribe({
        next: (res) => {
          this.updatedUniversity.logoUrl = res.fileName;
        },
        error: (err) => console.error('Ошибка при загрузке логотипа:', err)
      });
    }
  }
}
