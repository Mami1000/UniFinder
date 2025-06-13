
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface Profession {
  name: string;
  minScore: number;
  universityId: string;
  faculty: string;
  type: string; 
}

@Injectable({
  providedIn: 'root'
})
export class ProfessionService {
  private apiUrl = `${environment.apiBaseUrl}/api/profession`;

  constructor(private http: HttpClient) {}

  createProfession(profession: Profession): Observable<any> {
    return this.http.post(this.apiUrl, profession);
  }
  getAllProfessions(): Observable<Profession[]> {
  return this.http.get<Profession[]>(this.apiUrl);
 }
  bulkCreateProfessions(professions: Profession[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk`, professions);
  }
}
