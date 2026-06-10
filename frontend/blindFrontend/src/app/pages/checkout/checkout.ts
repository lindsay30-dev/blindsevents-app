import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { TicketService } from '../../core/services/ticket.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { CurrencyPipe } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, NavbarComponent, FooterComponent],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);
  private ticketService = inject(TicketService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private notify = inject(NotificationService);

  total = 0;
  selectedMethod: string | null = null;

  ngOnInit() {
    this.total = this.cartService.getTotal();
  }

  selectMethod(method: string) {
    this.selectedMethod = method;
  }

  pay() {
    if (!this.selectedMethod) {
      this.notify.error('Choisissez un moyen de paiement');
      return;
    }

    const user = this.auth.currentUser();
    if (!user) {
      this.notify.error('Vous devez être connecté');
      return;
    }

    this.notify.loading('Traitement en cours...');

    // Simulation d'un délai de paiement (2 secondes)
    setTimeout(() => {
      try {
        const items = this.cartService.items();

        // ✅ APPEL DIRECT (plus de .subscribe())
        for (const item of items) {
          this.ticketService.purchase(
            user.id,
            item.eventId,
            item.ticketType,
            item.quantity,
            item.price * item.quantity,
            item.eventTitle || '',
            item.eventDate || '',
            `${user.prenom} ${user.nom}`
          );
        }

        this.cartService.clear();
        this.notify.clear();
        this.notify.success('Paiement réussi ! Billets disponibles dans "Mes billets"');
        this.router.navigate(['/wallet']);
      } catch (err) {
        console.error('Erreur achat:', err);
        this.notify.clear();
        this.notify.error('Erreur lors du paiement');
      }
    }, 2000);
  }
}
