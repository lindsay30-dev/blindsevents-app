import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { Event } from '../../core/models/event.model';
import { Booking } from '../../core/models/booking.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  event: Event | null     = null;
  items: any[]            = [];
  total                   = 0;
  step                    = 1;
  selectedMethod          = '';
  loading                 = false;
  error                   = '';
  booking: Booking | null = null;
  paymentForm: FormGroup;

  processingMessages = [
    'Connexion au serveur de paiement…',
    'Vérification du numéro…',
    'Envoi de la demande…',
    'Attente de confirmation…',
    'Validation du paiement…',
    'Génération du billet…'
  ];
  currentMessage = 0;
  processingInterval: any;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private router: Router
  ) {
    this.paymentForm = this.fb.group({
      phone_number: ['', Validators.required],
      holder_name:  ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const eventStr = sessionStorage.getItem('checkout_event');
    const itemsStr = sessionStorage.getItem('checkout_items');
    const total    = sessionStorage.getItem('checkout_total');

    if (!eventStr || !itemsStr) {
      this.router.navigate(['/']);
      return;
    }

    this.event = JSON.parse(eventStr);
    this.items = JSON.parse(itemsStr);
    this.total = Number(total);
  }

  selectMethod(method: string): void {
    this.selectedMethod = method;
    if (method === 'card') {
      this.paymentForm.get('phone_number')?.clearValidators();
    } else {
      this.paymentForm.get('phone_number')?.setValidators(Validators.required);
    }
    this.paymentForm.get('phone_number')?.updateValueAndValidity();
  }

  goToStep2(): void { this.step = 2; }
  goToStep3(): void {
    if (this.paymentForm.invalid && this.total > 0) return;
    this.step = 3;
    this.startProcessing();
  }

  startProcessing(): void {
    this.currentMessage = 0;
    this.processingInterval = setInterval(() => {
      this.currentMessage++;
      if (this.currentMessage >= this.processingMessages.length) {
        clearInterval(this.processingInterval);
        this.submitBooking();
      }
    }, 700);
  }

  submitBooking(): void {
    this.loading = true;
    const payload: any = {
      event_id:       this.event!.id,
      payment_method: this.total === 0 ? 'free' : this.selectedMethod,
      items:          this.items
    };

    if (this.total > 0 && this.selectedMethod !== 'card') {
      payload.phone_number = this.paymentForm.get('phone_number')?.value;
    }

    this.bookingService.createBooking(payload).subscribe({
      next: booking => {
        this.booking = booking;
        this.loading = false;
        this.step    = 4;
        sessionStorage.clear();
      },
      error: err => {
        this.error   = err.error?.detail || 'Erreur lors du paiement.';
        this.loading = false;
        this.step    = 2;
      }
    });
  }

  getItemName(ticketTypeId: number): string {
    return this.event?.ticket_types.find(t => t.id === ticketTypeId)?.name || '';
  }

  getItemPrice(ticketTypeId: number): number {
    return this.event?.ticket_types.find(t => t.id === ticketTypeId)?.price || 0;
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goWallet(): void {
    this.router.navigate(['/wallet']);
  }
}
