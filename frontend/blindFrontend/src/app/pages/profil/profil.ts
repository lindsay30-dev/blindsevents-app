import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profil.html',
  styleUrl: './profil.css'
})
export class Profile implements OnInit {
  profileForm: FormGroup;
  loading  = false;
  success  = '';
  error    = '';
  user: User | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name:  ['', Validators.required],
      email:      ['', [Validators.required, Validators.email]],
      profile: this.fb.group({
        phone: [''],
        bio:   [''],
        role:  ['']
      })
    });
  }

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: user => {
        this.user = user;
        this.profileForm.patchValue({
          first_name: user.first_name,
          last_name:  user.last_name,
          email:      user.email,
          profile: {
            phone: user.profile?.phone || '',
            bio:   user.profile?.bio   || '',
            role:  user.profile?.role  || ''
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;
    this.loading = true;
    this.error   = '';
    this.success = '';

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.success = 'Profil mis à jour avec succès !';
        this.loading = false;
      },
      error: err => {
        this.error   = 'Erreur lors de la mise à jour.';
        this.loading = false;
      }
    });
  }
}
