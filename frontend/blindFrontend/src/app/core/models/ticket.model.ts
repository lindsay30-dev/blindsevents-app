export interface Ticket {
  id: string;
  userId: string;
  eventId: string;
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  purchaseDate: string;
  reference: string;
  status: 'valid' | 'used' | 'cancelled';
  qrData: string;
}