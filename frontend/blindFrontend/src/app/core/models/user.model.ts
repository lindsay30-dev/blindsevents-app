export interface Profile {
  id: number;
  role: 'organizer' | 'participant';
  phone: string;
  avatar: string;
  bio: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: Profile;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
  role: 'organizer' | 'participant';
}
