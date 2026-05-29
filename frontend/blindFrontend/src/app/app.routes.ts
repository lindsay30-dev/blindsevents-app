import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./pages/auth/login/login').then(m => m.Login)
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./pages/auth/register/register').then(m => m.Register)
  },
  {
    path: 'events/:id',
    loadComponent: () =>
      import('./pages/event-detail/event-detail').then(m => m.EventDetail)
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/checkout/checkout').then(m => m.Checkout)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'wallet',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/wallet/wallet').then(m => m.Wallet)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profil/profil').then(m => m.Profile)
  },
  {
    path: '**',
    redirectTo: ''
  }
];