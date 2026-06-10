import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, BookingCreate } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  createBooking(data: BookingCreate): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/bookings/`, data);
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings/`);
  }

  getWallet(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings/wallet/`);
  }

  cancelBooking(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings/${id}/cancel/`, {});
  }

  verifyTicket(ref: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings/verify/`, { payment_ref: ref });
  }
}