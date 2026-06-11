import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TicketService } from '../../core/services/ticket.service';
import { NotificationService } from '../../core/services/notification.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { Html5Qrcode } from 'html5-qrcode';

@Component({
  selector: 'app-scan-ticket',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './scan-ticket.html',
  styleUrls: ['./scan-ticket.css']
})
export class ScanTicketComponent {
  private ticketService = inject(TicketService);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private html5QrCode: Html5Qrcode | null = null;
  scanning = false;

  startScan() {
    this.scanning = true;
    this.html5QrCode = new Html5Qrcode('qr-reader');
    this.html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      (decodedText: string) => {
        // On extrait la référence du billet (format attendu: ticket:ref ou directement ref)
        let ref = decodedText;
        if (decodedText.startsWith('ticket:')) {
          ref = decodedText.split(':')[1];
        }
        const success = this.ticketService.validateTicket(ref);
        if (success) {
          this.notify.success('Billet validé !');
        } else {
          this.notify.error('Billet invalide ou déjà utilisé');
        }
        this.stopScan();
      },
      (error: any) => console.warn(error)
    ).catch((err: string) => {
      this.notify.error('Erreur caméra: ' + err);
      this.scanning = false;
    });
  }

  stopScan() {
    if (this.html5QrCode) {
      this.html5QrCode.stop().then(() => {
        this.html5QrCode = null;
        this.scanning = false;
      });
    }
  }
  onScanSuccess(decodedText: string) {
  this.ticketService.validateTicket(decodedText).subscribe({
    next: () => this.notify.success('Billet validé'),
    error: (err) => this.notify.error(err.error.message)
  });
}
}