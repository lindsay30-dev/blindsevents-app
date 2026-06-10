import { Injectable, signal } from '@angular/core';
import { Event, TicketType } from '../models/event.model';
import { NotificationService } from './notification.service';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventService {
  private STORAGE_KEY = 'bigshot_events';
  events = signal<Event[]>([]);

  constructor(private notify: NotificationService) {
    this.load();
  }

  private load() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.events.set(JSON.parse(stored));
    } else {
      this.seed();
    }
  }

  private seed() {
    const sampleEvents: Event[] = [
      {
        id: '1',
        title: 'La Nuit des Étoiles : Gala Annuel 2024',
        description: 'Rejoignez-nous pour la soirée la plus attendue de l\'année. Une expérience unique mêlant gastronomie, musique et élégance au cœur de Yaoundé.',
        category: 'Gala',
        date: '2026-12-24',
        time: '20:00',
        location: 'Palais des Congrès, Yaoundé',
        dressCode: 'Cravate Noire / Tenue Traditionnelle de Gala',
        tickets: [
          { type: 'Pass Bronze', price: 50000, available: 200 },
          { type: 'Pass VIP Or', price: 150000, available: 50 }
        ],
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        organizerId: 'org1',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Concert Jazz Africain',
        description: 'Une soirée de jazz exceptionnelle avec les meilleurs artistes camerounais et internationaux.',
        category: 'Concert',
        date: '2026-08-15',
        time: '19:00',
        location: 'Palais des Congrès, Yaoundé',
        tickets: [
          { type: 'Standard', price: 25000, available: 500 },
          { type: 'VIP', price: 75000, available: 100 }
        ],
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
        organizerId: 'org1',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Gala Corporate - Cérémonie des Mélèzes',
        description: 'Célébration des entreprises leaders du Cameroun. Une soirée prestige pour récompenser l\'excellence.',
        category: 'Gala',
        date: '2026-09-16',
        time: '18:00',
        location: 'Hilton Hotel, Yaoundé',
        dressCode: 'Tenue de soirée',
        tickets: [
          { type: 'Entreprise', price: 200000, available: 30 },
          { type: 'Invité', price: 100000, available: 150 }
        ],
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        organizerId: 'org1',
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Exposition d\'Art Contemporain',
        description: 'Découvrez les talents camerounais à travers une exposition unique d\'art contemporain.',
        category: 'Culture',
        date: '2026-10-06',
        time: '15:00',
        location: 'Musée National, Yaoundé',
        tickets: [
          { type: 'Entrée', price: 10000, available: 1000 }
        ],
        imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
        organizerId: 'org1',
        createdAt: new Date().toISOString()
      }
    ];
    this.events.set(sampleEvents);
    this.save();
  }

  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events()));
  }

  getById(id: string): Event | undefined {
    return this.events().find(e => e.id === id);
  }

  getByOrganizer(organizerId: string): Event[] {
    return this.events().filter(e => e.organizerId === organizerId);
  }

  getByCategory(category: string): Event[] {
    if (category === 'all' || !category) return this.events();
    return this.events().filter(e => e.category.toLowerCase() === category.toLowerCase());
  }

  // ✅ NOUVELLE MÉTHODE : Retourne un Observable compatible avec .subscribe()
  getEvents(params?: any): Observable<any> {
    let filtered = this.events();

    if (params?.category) {
      filtered = filtered.filter(e => e.category.toLowerCase() === params.category.toLowerCase());
    }
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(search) ||
        e.description.toLowerCase().includes(search)
      );
    }

    return of({ results: filtered });
  }

  // ✅ NOUVELLE MÉTHODE : Retourne les catégories
  getCategories(): Observable<any[]> {
    const categories = [
      { slug: 'gala', name: 'Galas' },
      { slug: 'concert', name: 'Concerts' },
      { slug: 'culture', name: 'Culture' },
      { slug: 'sport', name: 'Sport' },
      { slug: 'conference', name: 'Conférences' }
    ];
    return of(categories);
  }

  getMyEvents(): Observable<any> {
    return of(this.events());
  }

  publishEvent(id: string): Observable<any> {
    return of({ success: true });
  }

  deleteEvent(id: string): Observable<any> {
    this.delete(id);
    return of({ success: true });
  }

  create(event: Omit<Event, 'id' | 'createdAt'>, imageFile?: File): Promise<void> {
    return new Promise((resolve) => {
      const newEvent: Event = {
        ...event,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      if (imageFile) {
        const reader = new FileReader();
        reader.onload = () => {
          newEvent.imageUrl = reader.result as string;
          this.events.update(ev => [...ev, newEvent]);
          this.save();
          this.notify.success('Événement créé avec succès');
          resolve();
        };
        reader.readAsDataURL(imageFile);
      } else {
        this.events.update(ev => [...ev, newEvent]);
        this.save();
        this.notify.success('Événement créé avec succès');
        resolve();
      }
    });
  }

  update(event: Event, imageFile?: File): Promise<void> {
    return new Promise((resolve) => {
      if (imageFile) {
        const reader = new FileReader();
        reader.onload = () => {
          const updated = { ...event, imageUrl: reader.result as string };
          this.events.update(ev => ev.map(e => e.id === event.id ? updated : e));
          this.save();
          this.notify.success('Événement modifié');
          resolve();
        };
        reader.readAsDataURL(imageFile);
      } else {
        this.events.update(ev => ev.map(e => e.id === event.id ? event : e));
        this.save();
        this.notify.success('Événement modifié');
        resolve();
      }
    });
  }

  delete(id: string) {
    this.events.update(ev => ev.filter(e => e.id !== id));
    this.save();
    this.notify.success('Événement supprimé');
  }
}
