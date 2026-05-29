import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;
  loading   = false;
  error     = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error   = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.authService.getProfile().subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: ()  => this.router.navigate(['/'])
        });
      },
      error: err => {
        this.error   = err.error?.detail || 'Identifiants incorrects.';
        this.loading = false;
      }
    });
  }
}