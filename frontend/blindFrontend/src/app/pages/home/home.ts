import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { Event } from '../../core/models/event.model';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  events: Event[] = [];
  categories: any[] = [];
  loading = false;
  searchTerm = '';
  selectedCategory = '';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.eventService.loadEvents().subscribe();

  }

  loadCategories(): void {
    this.eventService.getCategories().subscribe({
      next: (data: any[]) => this.categories = data,
      error: (err: any) => console.error(err)
    });
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getEvents({
      category: this.selectedCategory || undefined,
      search: this.searchTerm || undefined
    }).subscribe({
      next: (data: any) => {
        this.events = data.results || data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  filterByCategory(slug: string): void {
    this.selectedCategory = slug;
    this.loadEvents();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.loadEvents();
  }

  getMinPrice(event: any): number {
    if (!event.tickets || event.tickets.length === 0) return 0;
    return Math.min(...event.tickets.map((t: any) => t.price));
  }

  getTotalSpots(event: any): number {
    if (!event.tickets) return 0;
    return event.tickets.reduce((sum: number, t: any) => sum + t.available, 0);
  }
}
