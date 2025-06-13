import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface Question {
  id?: string;        // уникальный идентификатор вопроса (опционально)
  text: string;       // текст вопроса
  answer: string;     // правильный ответ
  point: number;      // баллы за вопрос
  quantity: number;
  categoryId: string;
  categoryName?: string;
  imageUrl?: string;  
}

export interface Test {
  id: string;
  name: string;
  time: number;
  questions: Question[];
  sessionId?: string; 
}

export interface CreateTestDto {
  name: string;
  time: number;
  questions: { quantity: number; categoryId: string }[];
}

// Интерфейс для ответа кандидата на вопрос
export interface CandidateAnswer {
  questionId: string;
  answer: string;
}

// DTO для завершения теста
export interface FinishTestDto {
  sessionId: string;
  answers: CandidateAnswer[];
  userId?: string; 
}

export interface FinishTestResponse {
  message: string;
  score: number;
  isFirstAttempt: boolean;
  correctCount: number;
  totalQuestions: number;
  categoryResults: {
    category: string;
    correct: number;
    total: number;
  }[];
  recommendations: {
    recommendations: any[]; 
    closestProfession?: {
      name: string;
      faculty: string;
      type: 'paid' | 'budget';
      minScore: number;
      university: string;
      location: string;
      logoUrl?: string;
    };
    neededPoints?: number;
  };
}


@Injectable({
  providedIn: 'root'
})
export class TestService {
  private apiUrl = `${environment.apiBaseUrl}/api/test`;

  constructor(private http: HttpClient) {}

  createTest(test: CreateTestDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, test);
  }

  getTests(): Observable<Test[]> {
    return this.http.get<Test[]>(`${this.apiUrl}/list`);
  }

  getTestById(id: string): Observable<Test> {
    return this.http.get<Test>(`${this.apiUrl}/${id}`);
  }
  
  sendMessage(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/sendMessage`, payload);
  }
  
  getCodeForTest(testId: string, userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/CreateCodeForTest/${testId}`, { params: { userId: userId } });
  }
  
  openTest(key: string, testId: string): Observable<Test> {
    return this.http.get<Test>(`${this.apiUrl}/open`, { params: { key, testId } });
  }
  
  finishTest(dto: FinishTestDto): Observable<FinishTestResponse> {
    return this.http.post<FinishTestResponse>(`${this.apiUrl}/finish`, dto);
  }
   // Метод для поиска тестов по имени
   searchTests(term: string): Observable<Test[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<Test[]>(`${this.apiUrl}/search`, { params });
  }
  deleteTest(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}