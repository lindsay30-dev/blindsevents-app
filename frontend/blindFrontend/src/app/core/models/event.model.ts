export interface TicketType {
  type: string;
  price: number;
  available: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  dressCode?: string;
  tickets: TicketType[];
  imageUrl?: string;
  organizerId: string;
  createdAt: string;
}