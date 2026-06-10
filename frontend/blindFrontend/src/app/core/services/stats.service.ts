import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  // ⚠️ ADAPTEZ CETTE URL à celle de votre backend
  private apiUrl = 'http://localhost:8000/api/stats'; 

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/`);
  }
}