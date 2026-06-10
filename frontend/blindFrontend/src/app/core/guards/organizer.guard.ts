import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const organizerGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);
  const user = auth.currentUser();
  if (user && user.role === 'ORGANISATEUR') return true;
  notify.error('Accès réservé aux organisateurs');
  router.navigate(['/dashboard']);
  return false;
};
