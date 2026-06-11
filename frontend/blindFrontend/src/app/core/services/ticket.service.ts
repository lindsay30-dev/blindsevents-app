import { Injectable, signal } from '@angular/core';
import { NotificationService } from './notification.service';

export interface Ticket {
  toPromise(): any;
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation?: string;
  userId: string;
  userName: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'pending';
  reference: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  private STORAGE_KEY = 'bigshot_tickets';
  tickets = signal<Ticket[]>([]);

  constructor(private notify: NotificationService) {
    this.load();
  }

  private load() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.tickets.set(JSON.parse(stored));
    } else {
      this.seed();
    }
  }

  private seed() {
    const sampleTickets: Ticket[] = [
      {
        id: 't1',
        eventId: '1',
        eventTitle: 'La Nuit des Étoiles : Gala Annuel 2024',
        eventDate: '2026-12-24',
        eventLocation: 'Palais des Congrès, Yaoundé',
        userId: 'part1',
        userName: 'Marie NDAO',
        ticketType: 'Pass VIP Or',
        quantity: 1,
        totalPrice: 150000,
        status: 'confirmed',
        reference: 'BS-7721-YK9',
        createdAt: new Date().toISOString()
      },
      {
        id: 't2',
        eventId: '2',
        eventTitle: 'Concert Jazz Africain',
        eventDate: '2026-08-15',
        eventLocation: 'Palais des Congrès, Yaoundé',
        userId: 'part1',
        userName: 'Marie NDAO',
        ticketType: 'Standard',
        quantity: 2,
        totalPrice: 50000,
        status: 'confirmed',
        reference: 'BS-8890-ZA2',
        createdAt: new Date().toISOString()
      }
    ];
    this.tickets.set(sampleTickets);
    this.save();
  }

  private save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tickets()));
  }

  getUserTickets(userId: string): Ticket[] {
    return this.tickets().filter(t => t.userId === userId);
  }

  getAllTickets(): Ticket[] {
    return this.tickets();
  }

  getByEvent(eventId: string): Ticket[] {
    return this.tickets().filter(t => t.eventId === eventId);
  }

  purchase(userId: string, eventId: string, ticketType: string, quantity: number, totalPrice: number, eventTitle = '', eventDate = '', userName = ''): Ticket {
    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      eventId,
      eventTitle,
      eventDate,
      userId,
      userName,
      ticketType,
      quantity,
      totalPrice,
      status: 'confirmed',
      reference: `BS-${Math.floor(1000 + Math.random() * 9000)}-${crypto.randomUUID().slice(0, 3).toUpperCase()}`,
      createdAt: new Date().toISOString()
    };
    this.tickets.update(t => [...t, newTicket]);
    this.save();
    this.notify.success('Billet créé avec succès');
    return newTicket;
  }

  verifyTicket(ticketId: string): Ticket | undefined {
    return this.tickets().find(t => t.id === ticketId || t.reference === ticketId);
  }

  validateTicket(reference: string): boolean {
    const ticket = this.tickets().find(t => t.reference === reference);
    return !!(ticket && ticket.status === 'confirmed');
  }

  cancel(ticketId: string) {
    this.tickets.update(t => t.map(tk => tk.id === ticketId ? { ...tk, status: 'cancelled' as const } : tk));
    this.save();
    this.notify.info('Billet annulé');
  }
}
