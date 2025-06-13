import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Question } from '../../models/question.model';

export interface BulkQuestionModel {
  questions: Partial<Question>[];
}

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = `${environment.apiBaseUrl}/api/question`;

  constructor(private http: HttpClient) {}

  createQuestion(questionData: FormData): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/create`, questionData);
  }

  createBulkQuestions(bulkPayload: BulkQuestionModel): Observable<Question[]> {
    return this.http.post<Question[]>(`${this.apiUrl}/bulk-create`, bulkPayload);
  }

  deleteQuestion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  updateQuestion(id: string, formData: FormData): Observable<{ message: string; question: Question }> {
    return this.http.put<{ message: string; question: Question }>(`${this.apiUrl}/update/${id}`, formData);
  }

getFullImageUrl(imageUrl?: string): string {
  return imageUrl ? `${environment.apiBaseUrl}/api/media/decrypt-photo?fileName=${imageUrl}` : '';
}

  deleteQuestionImage(id: string): Observable<{ message: string }> {
  return this.http.delete<{ message: string }>(`${this.apiUrl}/delete-image/${id}`);
 }
}
