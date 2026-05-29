import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../core/models/booking.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wallet.html',
  styleUrl: './wallet.css'
})
export class Wallet implements OnInit {
  bookings: Booking[] = [];
  loading             = false;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadWallet();
  }

  loadWallet(): void {
    this.loading = true;
    this.bookingService.getWallet().subscribe({
      next: data => {
        this.bookings = data;
        this.loading  = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  cancelBooking(id: number): void {
    if (!confirm('Annuler cette réservation ?')) return;
    this.bookingService.cancelBooking(id).subscribe({
      next: () => this.loadWallet(),
      error: err => console.error(err)
    });
  }
}
