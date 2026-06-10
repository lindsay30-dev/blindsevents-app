import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { TicketService } from '../../core/services/ticket.service';
import { Event } from '../../core/models/event.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  events: Event[] = [];
  loading = false;
  stats = { total_events: 0, total_sold: 0, total_revenue: 0 };

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private ticketService: TicketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  get isOrganizer(): boolean {
    return this.currentUser?.role === 'ORGANISATEUR';
  }

  loadData(): void {
    this.loading = true;

    if (this.isOrganizer && this.currentUser) {
      // Organisateur : charger ses événements et calculer les stats
      this.events = this.eventService.getByOrganizer(this.currentUser.id);
      this.stats.total_events = this.events.length;

      const allTickets = this.ticketService.getAllTickets();
      const myEventIds = this.events.map(e => e.id);
      const soldTickets = allTickets.filter(t => myEventIds.includes(t.eventId));

      this.stats.total_sold = soldTickets.reduce((sum, t) => sum + t.quantity, 0);
      this.stats.total_revenue = soldTickets.reduce((sum, t) => sum + t.totalPrice, 0);
    } else {
      // Participant : charger tous les événements
      this.events = this.eventService.events();
    }

    this.loading = false;
  }

  getMinPrice(event: any): number {
    if (!event.tickets || event.tickets.length === 0) return 0;
    return Math.min(...event.tickets.map((t: any) => t.price));
  }

  getStatusLabel(status: string): string {
    return status ? status.toUpperCase() : 'ACTIF';
  }

  getStatusClass(status: string): string {
    return 'status-active';
  }

  deleteEvent(id: string): void {
    if (!confirm('Confirmer la suppression ?')) return;
    this.eventService.delete(id);
    this.loadData();
  }

  reserveEvent(event: Event): void {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const defaultTicket = event.tickets?.[0];
    if (!defaultTicket) {
      alert("Aucun billet disponible.");
      return;
    }

    sessionStorage.setItem('checkout_event', JSON.stringify(event));
    sessionStorage.setItem('checkout_items', JSON.stringify([{
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      ticketType: defaultTicket.type,
      price: defaultTicket.price,
      quantity: 1
    }]));
    sessionStorage.setItem('checkout_total', String(defaultTicket.price));
    this.router.navigate(['/checkout']);
  }
}
