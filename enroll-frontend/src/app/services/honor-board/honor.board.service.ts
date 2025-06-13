import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HonorBoardService {
  private apiUrl = `${environment.apiBaseUrl}/api/test`;

    constructor(private http: HttpClient) {}

  getHonorBoard(testId: string) {
    return this.http.get<any[]>(`${this.apiUrl}/honorboard/${testId}`);
  }
}