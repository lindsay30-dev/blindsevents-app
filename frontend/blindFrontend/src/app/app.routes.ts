import { Routes } from '@angular/router';
import { Home } from './pages/home/home';  // ✅ Home au lieu de HomeComponent
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Profile } from './pages/profil/profil';
import { EventDetailComponent } from './pages/event-detail/event-detail';
import { EventCreateComponent } from './pages/event-create/event-create';
import { CheckoutComponent } from './pages/checkout/checkout';
import { WalletComponent } from './pages/wallet/wallet';
import { VerifyTicketComponent } from './pages/verify-ticket/verify-ticket';

export const routes: Routes = [
  { path: '', component: Home },  // ✅ Home au lieu de HomeComponent
  { path: 'home', component: Home },  // ✅ Home au lieu de HomeComponent
  { path: 'login', component: LoginComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'dashboard', component: Dashboard },
  { path: 'profil', component: Profile },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'event-create', component: EventCreateComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'wallet', component: WalletComponent },
  { path: 'verify-ticket/:id', component: VerifyTicketComponent },
  { path: '**', redirectTo: '' }
];
