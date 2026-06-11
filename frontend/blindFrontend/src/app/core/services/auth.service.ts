import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { User } from '../models/user.model';
import { tap, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private notify = inject(NotificationService);
  private apiUrl = 'http://localhost:3000/api/auth';

  currentUser = signal<User | null>(null);

  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      this.fetchMe().subscribe();
    }
  }

  private fetchMe() {
    return this.http.get<User>('http://localhost:3000/api/users/me', {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    }).pipe(
      tap(user => this.currentUser.set(user)),
      catchError(() => {
        localStorage.removeItem('token');
        return of(null);
      })
    );
  }

  register(userData: any, password: string) {
    return this.http.post<{ token: string; user: User }>(`${this.apiUrl}/register`, { ...userData, password })
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
          this.currentUser.set(res.user);
          this.notify.success('Inscription réussie');
          this.router.navigate(['/dashboard']);
        })
      );
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: User }>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
          this.currentUser.set(res.user);
          this.notify.success('Connexion réussie');
          this.router.navigate(['/dashboard']);
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
    this.notify.info('Déconnecté');
  }

  updateProfile(updates: Partial<User>, avatarFile?: File) {
    const formData = new FormData();
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof User] !== undefined)
        formData.append(key, updates[key as keyof User] as string);
    });
    if (avatarFile) formData.append('avatar', avatarFile);
    return this.http.put<User>('http://localhost:3000/api/users/me', formData, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    }).pipe(tap(user => this.currentUser.set(user)));
  }
}
