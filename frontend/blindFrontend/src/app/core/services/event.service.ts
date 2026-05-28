import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Event, Category, EventFilters } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEvents(filters?: EventFilters): Observable<any> {
    let params = new HttpParams();
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.search)   params = params.set('search', filters.search);
    if (filters?.is_online !== undefined)
      params = params.set('is_online', String(filters.is_online));
    return this.http.get<any>(`${this.apiUrl}/events/`, { params });
  }

  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}/`);
  }

  getMyEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/my_events/`);
  }

  createEvent(data: FormData): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/events/`, data);
  }

  updateEvent(id: number, data: FormData): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/events/${id}/`, data);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${id}/`);
  }

  publishEvent(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/${id}/publish/`, {});
  }

  cancelEvent(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/${id}/cancel/`, {});
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/`);
  }
}
