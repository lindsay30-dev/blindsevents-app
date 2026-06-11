import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { TicketService } from '../../core/services/ticket.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { CurrencyPipe } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { PaymentService } from '../../core/services/paiement.service';

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

private paymentService = inject(PaymentService);

pay() {
  if (!this.selectedMethod) return;
  this.paymentService.simulatePayment(this.selectedMethod, this.total).subscribe({
    next: () => {
      const purchases = this.cartService.items().map((item): any =>
        this.ticketService.purchase(item.eventId, item.ticketType, item.quantity, item.price * item.quantity).toPromise()
      );
      Promise.all(purchases).then(() => {
        this.cartService.clear();
        this.router.navigate(['/wallet']);
      });
    },
    error: () => this.notify.error('Paiement échoué')
  });
}
}
