import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { TicketService } from '../../../core/services/ticket.service';
import { Event } from '../../../core/models/event.model';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './organizer-dashboard.html',
  styleUrls: ['./organizer-dashboard.css']
})
export class OrganizerDashboardComponent implements OnInit {
  private eventService = inject(EventService);
  private auth = inject(AuthService);
  private ticketService = inject(TicketService);

  myEvents: Event[] = [];
  stats = { eventsCount: 0, totalInvites: 0, revenue: 0 };
  chart: any;

  ngOnInit() {
    // ✅ currentUser est un signal
    const user = this.auth.currentUser();
    if (!user) return;

    // ✅ getByOrganizer retourne un tableau direct
    this.myEvents = this.eventService.getByOrganizer(user.id);
    this.stats.eventsCount = this.myEvents.length;

    // Calculer invitations (somme des places disponibles)
    this.stats.totalInvites = this.myEvents.reduce((acc, e) => {
      return acc + e.tickets.reduce((s, t) => s + t.available, 0);
    }, 0);

    // Calculer revenus
    const allTickets = this.ticketService.getAllTickets();
    const myEventIds = this.myEvents.map(e => e.id);
    const soldTickets = allTickets.filter(t => myEventIds.includes(t.eventId));
    this.stats.revenue = soldTickets.reduce((sum, t) => sum + t.totalPrice, 0);

    // Initialiser le graphique après un court délai (pour que le DOM soit prêt)
    setTimeout(() => this.initChart(), 100);
  }

  initChart() {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
          datasets: [{
            label: 'Revenus (XAF)',
            data: [120000, 250000, 180000, 300000, 450000, this.stats.revenue],
            borderColor: '#e6c364',
            tension: 0.3
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }
}