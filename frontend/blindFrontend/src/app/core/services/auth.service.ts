import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  getProfile() {
    throw new Error('Method not implemented.');
  }
  currentUser = signal<User | null>(null);

  constructor(private router: Router, private notify: NotificationService) {
    const stored = localStorage.getItem('bigshot_user');
    if (stored) this.currentUser.set(JSON.parse(stored));
    else this.seedDefaultUser();
  }

  private seedDefaultUser() {
    const users = this.getUsers();
    if (users.length === 0) {
      const defaultOrganizer: User & { password: string } = {
        id: 'org1',
        prenom: 'Jean-Paul',
        nom: 'MBIDA',
        username: 'jp_mbida',
        email: 'jp.mbida@example.com',
        role: 'ORGANISATEUR',
        phone: '699000000',
        bio: 'Passionné par l\'excellence...',
        verified: true,
        eliteLevel: true,
        avatar: 'assets/default-avatar.png',
        password: 'password123'
      };
      const defaultParticipant: User & { password: string } = {
        id: 'part1',
        prenom: 'Marie',
        nom: 'NDAO',
        username: 'marie_ndao',
        email: 'marie@example.com',
        role: 'PARTICIPANT',
        phone: '677888999',
        bio: '',
        verified: false,
        eliteLevel: false,
        avatar: 'assets/default-avatar.png',
        password: 'password123'
      };
      localStorage.setItem('bigshot_users', JSON.stringify([defaultOrganizer, defaultParticipant]));
    }
  }

  private getUsers(): any[] {
    return JSON.parse(localStorage.getItem('bigshot_users') || '[]');
  }

  register(userData: Omit<User, 'id' | 'verified' | 'eliteLevel'>, password: string): boolean {
    const users = this.getUsers();
    if (users.find(u => u.email === userData.email)) {
      this.notify.error('Email déjà utilisé');
      return false;
    }
    const newUser: User & { password: string } = {
      ...userData,
      id: crypto.randomUUID(),
      verified: false,
      eliteLevel: false,
      password
    };
    users.push(newUser);
    localStorage.setItem('bigshot_users', JSON.stringify(users));
    const { password: _, ...safeUser } = newUser;
    localStorage.setItem('bigshot_user', JSON.stringify(safeUser));
    this.currentUser.set(safeUser);
    this.notify.success('Inscription réussie');
    this.router.navigate(['/dashboard']);
    return true;
  }

  login(email: string, password: string): boolean {
    const users = this.getUsers();
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      this.notify.error('Identifiants incorrects');
      return false;
    }
    const { password: _, ...safeUser } = user;
    localStorage.setItem('bigshot_user', JSON.stringify(safeUser));
    this.currentUser.set(safeUser);
    this.notify.success('Connexion réussie');
    this.router.navigate(['/dashboard']);
    return true;
  }

  logout() {
    localStorage.removeItem('bigshot_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
    this.notify.info('Déconnecté');
  }

  updateProfile(updates: Partial<User>) {
    const current = this.currentUser();
    if (!current) return;
    const updated = { ...current, ...updates };
    localStorage.setItem('bigshot_user', JSON.stringify(updated));
    this.currentUser.set(updated);
    // Also update in users list
    const users = this.getUsers();
    const index = users.findIndex((u: any) => u.id === current.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem('bigshot_users', JSON.stringify(users));
    }
    this.notify.success('Profil mis à jour');
  }
  getAccessToken(): string | null {
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}
}