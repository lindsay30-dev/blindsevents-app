import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { StatsService } from '../../core/services/stats.service';
import { Event } from '../../core/models/event.model';
import { DashboardStats } from '../../core/models/stats.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  events: Event[]          = [];
  stats: DashboardStats | null = null;
  loading                  = false;

  constructor(
    private eventService: EventService,
    private statsService: StatsService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadMyEvents();
  }

  loadStats(): void {
    this.statsService.getDashboard().subscribe({
      next: data => this.stats = data,
      error: err  => console.error(err)
    });
  }

  loadMyEvents(): void {
    this.loading = true;
    this.eventService.getMyEvents().subscribe({
      next: data => {
        this.events  = data;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  publishEvent(id: number): void {
    this.eventService.publishEvent(id).subscribe({
      next: () => this.loadMyEvents(),
      error: err => console.error(err)
    });
  }

  deleteEvent(id: number): void {
    if (!confirm('Confirmer la suppression ?')) return;
    this.eventService.deleteEvent(id).subscribe({
      next: () => this.loadMyEvents(),
      error: err => console.error(err)
    });
  }
}
