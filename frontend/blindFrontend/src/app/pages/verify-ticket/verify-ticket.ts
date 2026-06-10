import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TicketService } from '../../core/services/ticket.service';

@Component({
  selector: 'app-verify-ticket',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container text-center py-5">
      <div *ngIf="loading">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2">Vérification du billet en cours...</p>
      </div>
      
      <div *ngIf="!loading && ticket">
        <div class="mb-3" style="font-size: 80px; color: green;">✓</div>
        <h2 class="text-success fw-bold">Billet Valide et Payé</h2>
        <div class="card p-4 mt-4 text-start mx-auto shadow" style="max-width: 500px;">
          <h4 class="mb-3">{{ ticket.eventTitle || 'Événement' }}</h4>
          <p class="mb-1"><strong>Date :</strong> {{ ticket.eventDate }}</p>
          <p class="mb-1"><strong>Participant :</strong> {{ ticket.userName }}</p>
          <p class="mb-1"><strong>Type :</strong> {{ ticket.ticketType }}</p>
          <hr>
          <p class="mb-0"><strong>Statut :</strong> <span class="badge bg-success fs-6">PAYÉ ET CONFIRMÉ</span></p>
        </div>
      </div>

      <div *ngIf="!loading && !ticket">
        <div class="mb-3" style="font-size: 80px; color: red;">✕</div>
        <h2 class="text-danger fw-bold">Billet Invalide</h2>
        <p class="text-muted">Ce billet n'existe pas, a déjà été utilisé ou n'a pas été payé.</p>
      </div>
    </div>
  `
})
export class VerifyTicketComponent implements OnInit {
  ticketId: string = '';
  ticket: any = null;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute, 
    private ticketService: TicketService
  ) {}

  ngOnInit() {
    this.ticketId = this.route.snapshot.paramMap.get('id') || '';
    if (this.ticketId) {
      // ✅ verifyTicket retourne un Ticket ou undefined, pas un Observable
      this.ticket = this.ticketService.verifyTicket(this.ticketId);
      this.loading = false;
    } else {
      this.loading = false;
    }
  }
}