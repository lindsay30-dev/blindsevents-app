import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TicketService, Ticket } from '../../core/services/ticket.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './wallet.html',
  styleUrls: ['./wallet.css']
})
export class WalletComponent implements OnInit {
  private auth = inject(AuthService);
  private ticketService = inject(TicketService);
  private notify = inject(NotificationService);
  tickets: Ticket[] = [];

  ngOnInit() {
  this.ticketService.getUserTickets().subscribe(tickets => this.tickets = tickets);
}
  }

  downloadTicket(ticket: Ticket) {
    const content = `Billet: ${ticket.reference}\nÉvénement: ${ticket.eventTitle}\nDate: ${ticket.eventDate}\nStatut: ${ticket.status}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billet_${ticket.reference}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    this.notify.success('Billet téléchargé');
  }

  showQR(ticket: Ticket) {
    const qrData = ticket.reference;
    alert(`QR Code data: ${qrData}\nScannez ce code pour valider le billet.`);
  }
}