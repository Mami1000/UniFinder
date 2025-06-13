import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { UniversityService, University } from '../../../services/university/university.service';
import { MediaService } from '../../../services/media/media.service';  // Импортируем MediaService
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-university-create',
  templateUrl: './create-university.component.html',
  styleUrls: ['./create-university.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class UniversityCreateComponent {
  universityForm: FormGroup;
  selectedLogoFile: File | null = null;
  logoPreviewUrl: string | null = null;
  logoFileName: string | null = null;  // Для хранения имени файла после загрузки
  logoUploading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private universityService: UniversityService,
    private mediaService: MediaService,  // Используем сервис для загрузки файлов
    private router: Router
  ) {
    this.universityForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      description: [''],
      logoUrl: [''],  // Сюда будет записано имя файла после загрузки
      courses: this.fb.array([]),
    });
  }

  get courses(): FormArray {
    return this.universityForm.get('courses') as FormArray;
  }

  addCourse(course: string): void {
    if (course) {
      this.courses.push(this.fb.control(course, Validators.required));
    }
  }

  removeCourse(index: number): void {
    this.courses.removeAt(index);
  }

  onLogoFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
  
    const file = input.files[0];
    if (!file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      alert("Пожалуйста, выберите файл с изображением (JPG, PNG, SVG и т.д.).");
      return;
    }
  
    this.selectedLogoFile = file;
  
    // Генерируем Data URL для предпросмотра логотипа
    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  
    // 👉 загружаем сразу
    this.uploadLogo();
  }
  

  uploadLogo(): void {
    if (this.selectedLogoFile) {
      this.logoUploading = true;
      this.mediaService.uploadUniversityLogo(this.selectedLogoFile).subscribe({
        next: (response) => {
          this.logoFileName = response.fileName;
          this.logoUploading = false;
        },
        error: (err) => {
          console.error('Ошибка загрузки файла', err);
          alert('Ошибка при загрузке логотипа');
          this.logoUploading = false;
        },
      });
    }
  }
  
  

  onSubmit(): void {
    if (this.universityForm.valid && this.logoFileName && !this.logoUploading) {
      const universityData: University = {
        name: this.universityForm.value.name,
        location: this.universityForm.value.location,
        description: this.universityForm.value.description,
        courses: this.universityForm.value.courses,
        logoUrl: this.logoFileName,
      };
  
      console.log('Отправка формы с данными:', universityData);
  
      this.universityService.createUniversityWithLogo(universityData).subscribe({
        next: (createdUniversity) => {
          console.log('Университет создан:', createdUniversity);
          this.router.navigate(['/universities']);
        },
        error: (err) => console.error('Ошибка создания университета:', err),
      });
    } else {
      console.warn('Форма не валидна, логотип не выбран или загружается.');
    }
  }
  
}
