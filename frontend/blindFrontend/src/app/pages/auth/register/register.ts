import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  prenom = '';
  nom = '';
  username = '';
  email = '';
  role: 'PARTICIPANT' | 'ORGANISATEUR' = 'PARTICIPANT';
  password = '';
  confirmPassword = '';

  constructor(private auth: AuthService) {}

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    this.auth.register({
      prenom: this.prenom,
      nom: this.nom,
      username: this.username,
      email: this.email,
      role: this.role,
      phone: '',
      bio: '',
      avatar: 'assets/default-avatar.png'
    }, this.password);
  }
}
