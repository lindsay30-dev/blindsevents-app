import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  success(message: string) {
    this.toastr.success(message, 'Succès', { positionClass: 'toast-top-right' });
  }
  error(message: string) {
    this.toastr.error(message, 'Erreur', { positionClass: 'toast-top-right' });
  }
  info(message: string) {
    this.toastr.info(message, 'Information', { positionClass: 'toast-top-right' });
  }
  warning(message: string) {
    this.toastr.warning(message, 'Attention', { positionClass: 'toast-top-right' });
  }
  loading(message: string) {
    this.toastr.info(message, 'Chargement', { disableTimeOut: true });
  }
  clear() {
    this.toastr.clear();
  }
}