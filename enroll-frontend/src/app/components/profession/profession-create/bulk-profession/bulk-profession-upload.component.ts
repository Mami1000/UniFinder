import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UniversityService, University } from '../../../../services/university/university.service';
import { environment } from '../../../../../environments/environment';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-bulk-profession-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bulk-profession-upload.component.html',
  styleUrls: ['./bulk-profession-upload.component.css']
})
export class BulkProfessionUploadComponent implements OnInit {
  professions: any[] = [];
  universities: University[] = [];

  uploadSuccess = false;
  uploadError = '';
  showToast = false;

  constructor(
    private http: HttpClient,
    private universityService: UniversityService
  ) {}

  ngOnInit(): void {
    this.universityService.getUniversities().subscribe({
      next: (data) => (this.universities = data),
      error: () => (this.uploadError = 'Ошибка загрузки университетов')
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    this.professions = []; // Очищаем перед повторной загрузкой
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (Array.isArray(data)) {
          this.professions = data;
          this.uploadError = '';
          this.uploadSuccess = false;
        } else {
          this.uploadError = 'JSON должен быть массивом.';
        }
      } catch (err) {
        this.uploadError = 'Ошибка чтения JSON.';
      }
    };

    reader.readAsText(file);
  }

  upload(): void {
    if (this.professions.length === 0) {
      this.uploadError = 'Нет данных для загрузки.';
      return;
    }

    const url = `${environment.apiBaseUrl}/api/profession/bulk`;

    this.http.post(url, this.professions).subscribe({
      next: () => {
        this.uploadSuccess = true;
        this.uploadError = '';
        this.showToast = true;

        setTimeout(() => (this.showToast = false), 3000);
      },
      error: (err) => {
        this.uploadError = 'Ошибка загрузки: ' + err.message;
        this.uploadSuccess = false;
      }
    });
  }

  resetUpload(): void {
    this.professions = [];
    this.uploadSuccess = false;
    this.uploadError = '';
    this.showToast = false;

    const fileInput = document.querySelector('input[type=file]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  getUniversityName(id: string): string {
    return this.universities.find(u => u.id === id)?.name ?? '—';
  }
}
