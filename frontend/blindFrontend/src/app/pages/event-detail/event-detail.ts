import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { Event, TicketType } from '../../core/models/event.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css'
})
export class EventDetail implements OnInit {
  event: Event | null = null;
  loading             = false;
  selectedQty: { [key: number]: number } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEvent(id);
  }

  loadEvent(id: number): void {
    this.loading = true;
    this.eventService.getEvent(id).subscribe({
      next: data => {
        this.event   = data;
        this.loading = false;
        data.ticket_types.forEach(t => this.selectedQty[t.id] = 0);
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  changeQty(ticketId: number, delta: number, max: number): void {
    const current = this.selectedQty[ticketId] || 0;
    this.selectedQty[ticketId] = Math.max(0, Math.min(max, 6, current + delta));
  }

  getTotal(): number {
    if (!this.event) return 0;
    return this.event.ticket_types.reduce((sum, t) => {
      return sum + (this.selectedQty[t.id] || 0) * t.price;
    }, 0);
  }

  getTotalQty(): number {
    return Object.values(this.selectedQty).reduce((s, q) => s + q, 0);
  }

  goToCheckout(): void {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }
    const items = this.event!.ticket_types
      .filter(t => (this.selectedQty[t.id] || 0) > 0)
      .map(t => ({ ticket_type_id: t.id, quantity: this.selectedQty[t.id] }));

    sessionStorage.setItem('checkout_event_id', String(this.event!.id));
    sessionStorage.setItem('checkout_items', JSON.stringify(items));
    sessionStorage.setItem('checkout_total', String(this.getTotal()));
    sessionStorage.setItem('checkout_event', JSON.stringify(this.event));
    this.router.navigate(['/checkout']);
  }
}
