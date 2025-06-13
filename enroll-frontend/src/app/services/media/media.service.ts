import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private apiUrl = `${environment.apiBaseUrl}/api/media`;

  constructor(private http: HttpClient) {}

  uploadUserPhoto(file: File): Observable<{ fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ fileName: string }>(`${this.apiUrl}/upload-user-photo`, formData);
  }

  uploadUniversityLogo(file: File): Observable<{ fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ fileName: string }>(`${this.apiUrl}/upload-university-logo`, formData);
  }
  getDecryptedPhotoUrl(fileName: string): string {
    return `${this.apiUrl}/decrypt-photo?fileName=${fileName}`;
  }
  uploadQuestionImage(file: File): Observable<{ fileName: string }> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post<{ fileName: string }>(`${this.apiUrl}/upload-question-image`, formData);
}

}
