import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { Event } from '../../core/models/event.model';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css'
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  loading = true;
  quantity: { [key: string]: number } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private cartService: CartService,
    private notify: NotificationService
  ) {}

  ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
  this.eventService.getById(id!).subscribe(event => {
    this.event = event;
    this.event.tickets.forEach(t => this.quantity[t.type] = 0);
  });
}

  increment(ticket: any): void {
    if (this.quantity[ticket.type] < 10) {
      this.quantity[ticket.type]++;
    }
  }

  decrement(ticket: any): void {
    if (this.quantity[ticket.type] > 0) {
      this.quantity[ticket.type]--;
    }
  }

  addToCart(ticket: any): void {
    if (!this.event) return;

    const qty = this.quantity[ticket.type] || 0;
    if (qty === 0) {
      this.notify.error('Sélectionnez une quantité');
      return;
    }

    this.cartService.addItem({
      eventId: this.event.id,
      eventTitle: this.event.title,
      eventDate: this.event.date,
      ticketType: ticket.type,
      price: ticket.price,
      quantity: qty
    });

    this.notify.success(`${qty} billet(s) ajouté(s) au panier`);
    this.quantity[ticket.type] = 0;
  }

  goToCheckout(): void {
    if (this.cartService.items().length === 0) {
      this.notify.error('Votre panier est vide');
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
