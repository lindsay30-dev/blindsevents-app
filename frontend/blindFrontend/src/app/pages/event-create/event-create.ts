import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './event-create.html',
  styleUrls: ['./event-create.css']
})
export class EventCreateComponent {
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private notify = inject(NotificationService);

  eventForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    category: ['Gala', Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required],
    location: ['', Validators.required],
    dressCode: [''],
    tickets: this.fb.array([])
  });

  selectedImage: File | null = null;
  imagePreview: string | null = null;

  addTicket() {
    // simplifié: on utilisera un champ dynamique mais pour la démo on fixe des tickets par défaut
  }

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0];
    if (this.selectedImage) {
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(this.selectedImage);
    }
  }

  submit() {
    if (this.eventForm.invalid) {
      this.notify.error('Veuillez remplir tous les champs');
      return;
    }
    const eventData = {
      ...this.eventForm.value,
      organizerId: this.auth.currentUser()!.id,
      tickets: [{ type: 'Standard', price: 10000, available: 100 }] // simplifié
    } as any;
    this.eventService.create(eventData, this.selectedImage || undefined).then(() => {
      this.router.navigate(['/dashboard']);
    });
  }
}
