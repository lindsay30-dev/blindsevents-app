import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ticket } from '../models/ticket.model';
import { Observable, tap } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);
  private notify = inject(NotificationService);
  private apiUrl = 'http://localhost:3000/api/tickets';

  getUserTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/me`, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }

  purchase(eventId: string, ticketType: string, quantity: number, totalPrice: number): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/purchase`, { eventId, ticketType, quantity, totalPrice }, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    }).pipe(tap(() => this.notify.success('Billet acheté')));
  }

  validateTicket(reference: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate`, { reference }, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }
}
