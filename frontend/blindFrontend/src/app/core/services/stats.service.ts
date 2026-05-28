import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EventStats, DashboardStats } from '../models/stats.model';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats/dashboard/`);
  }

  getEventStats(eventId: number): Observable<EventStats> {
    return this.http.get<EventStats>(`${this.apiUrl}/stats/events/${eventId}/`);
  }
}
