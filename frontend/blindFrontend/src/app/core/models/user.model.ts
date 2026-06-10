export interface User {
  id: string;
  prenom: string;
  nom: string;
  username: string;
  email: string;
  role: 'PARTICIPANT' | 'ORGANISATEUR';
  avatar?: string;
  phone?: string;
  bio?: string;
  verified: boolean;
  eliteLevel: boolean;
}