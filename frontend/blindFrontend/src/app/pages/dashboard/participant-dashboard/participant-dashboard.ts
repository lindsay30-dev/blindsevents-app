import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TicketService, Ticket } from '../../../core/services/ticket.service';

@Component({
  selector: 'app-participant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './participant-dashboard.html',
  styleUrls: ['./participant-dashboard.css']
})
export class ParticipantDashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private ticketService = inject(TicketService);

  upcomingTickets: Ticket[] = [];
  pastTickets: Ticket[] = [];

  ngOnInit() {
    // ✅ currentUser est un signal → on l'appelle avec ()
    const user = this.auth.currentUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    // ✅ getUserTickets retourne un tableau direct (pas un Observable)
    const allTickets = this.ticketService.getUserTickets(user.id);

    this.upcomingTickets = allTickets.filter(t => t.eventDate && t.eventDate >= today);
    this.pastTickets = allTickets.filter(t => t.eventDate && t.eventDate < today);
  }
}