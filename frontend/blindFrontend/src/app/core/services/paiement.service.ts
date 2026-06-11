import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/payments';

  simulatePayment(method: string, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/simulate`, { method, amount }, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
  }
}
