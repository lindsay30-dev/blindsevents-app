import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { Event, Category } from '../../core/models/event.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  events: Event[]       = [];
  categories: Category[] = [];
  loading               = false;
  searchTerm            = '';
  selectedCategory      = '';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadEvents();
  }

  loadCategories(): void {
    this.eventService.getCategories().subscribe({
      next: data => this.categories = data,
      error: err  => console.error(err)
    });
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getEvents({
      category: this.selectedCategory || undefined,
      search:   this.searchTerm || undefined
    }).subscribe({
      next: data => {
        this.events  = data.results || data;
        this.loading = false;
      },
      error: err => {
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

  getMinPrice(event: Event): number {
    if (!event.ticket_types?.length) return 0;
    return Math.min(...event.ticket_types.map(t => t.price));
  }
}