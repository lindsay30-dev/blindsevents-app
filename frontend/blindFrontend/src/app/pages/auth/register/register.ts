import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerForm: FormGroup;
  loading = false;
  error   = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name:  ['', Validators.required],
      username:   ['', Validators.required],
      email:      ['', [Validators.required, Validators.email]],
      role:       ['participant', Validators.required],
      password:   ['', [Validators.required, Validators.minLength(6)]],
      password2:  ['', Validators.required]
    }, { validators: this.passwordMatch });
  }

  passwordMatch(group: FormGroup) {
    const p1 = group.get('password')?.value;
    const p2 = group.get('password2')?.value;
    return p1 === p2 ? null : { mismatch: true };
  }

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.error   = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        const errors = err.error;
        this.error   = Object.values(errors).flat().join(' ') || 'Erreur lors de l\'inscription.';
        this.loading = false;
      }
    });
  }
}
