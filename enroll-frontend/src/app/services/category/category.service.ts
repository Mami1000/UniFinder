import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question } from '../../models/question.model';
import { environment } from '../../../environments/environment';
export interface Category {
  id: string;
  name: string;
}
export interface CategoryQuestionsResponse {
  id: string;
  name: string;
  questions: Question[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiBaseUrl}/api/category`;

  constructor(private http: HttpClient) { }

  // Получение списка категорий: GET api/category/list
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/list`);
  }

  // Создание категории: POST api/category/create
  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/create`, category);
  }

  // Получение вопросов по категории: GET api/category/{id}/questions
  getQuestionsByCategory(categoryId: string): Observable<CategoryQuestionsResponse> {
    return this.http.get<CategoryQuestionsResponse>(`${this.apiUrl}/${categoryId}/questions`);
  }
  
}
