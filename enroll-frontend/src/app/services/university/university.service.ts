import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface University {
  id?: string;         
  name: string;        
  location: string;     
  description: string;  
  logoUrl: string; 
  courses: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UniversityService {
  private baseUrl = `${environment.apiBaseUrl}/api/universities`; // Базовый URL для API университетов

  constructor(private http: HttpClient) {}

  // Получение списка университетов через GET /api/universities
  getUniversities(): Observable<University[]> {
    return this.http.get<University[]>(`${this.baseUrl}`); 
  }

  getUniversityById(id: string): Observable<University> {
    return this.http.get<University>(`${this.baseUrl}/${id}`);
  }

  createUniversity(university: University): Observable<University> {
    return this.http.post<University>(`${this.baseUrl}/create`, university);
  }
  createUniversityWithLogo(university: University): Observable<University> {
    const formData = new FormData();
    formData.append('name', university.name);
    formData.append('location', university.location);
    formData.append('description', university.description);
    formData.append('courses', JSON.stringify(university.courses));
    formData.append('logoUrl', university.logoUrl); 
  
    return this.http.post<University>(`${this.baseUrl}`, formData);
  }

  updateUniversity(id: string, university: University): Observable<University> {
  const formData = new FormData();
  formData.append('name', university.name);
  formData.append('location', university.location);
  formData.append('description', university.description);
  formData.append('courses', JSON.stringify(university.courses));
  if (university.logoUrl) {
    formData.append('logoUrl', university.logoUrl); // Это имя файла
  }

  return this.http.put<University>(`${this.baseUrl}/${id}`, formData);
}

}
