import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profil.html',
  styleUrl: './profil.css'
})
export class Profile implements OnInit {
  profileForm: FormGroup;
  loading = false;
  success = '';
  error = '';
  user: User | null = null;
  avatarPreview: string | null = null;

  statsData = { events: 24, guests: '1.2k' };

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.profileForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      bio: ['']
    });
  }

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.user = currentUser;
      this.avatarPreview = currentUser.avatar || null;
      this.profileForm.patchValue({
        prenom: currentUser.prenom,
        nom: currentUser.nom,
        email: currentUser.email,
        phone: currentUser.phone || '',
        bio: currentUser.bio || ''
      });
    }
  }

  onAvatarSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  save(): void {
    if (this.profileForm.invalid) return;

    this.loading = true;
    const updates: Partial<User> = {
      prenom: this.profileForm.get('prenom')?.value,
      nom: this.profileForm.get('nom')?.value,
      email: this.profileForm.get('email')?.value,
      phone: this.profileForm.get('phone')?.value,
      bio: this.profileForm.get('bio')?.value
    };

    if (this.avatarPreview) {
      updates.avatar = this.avatarPreview;
    }

    this.authService.updateProfile(updates);
    this.user = this.authService.currentUser();
    this.success = 'Profil mis à jour avec succès';
    this.loading = false;
    setTimeout(() => this.success = '', 3000);
  }
}
