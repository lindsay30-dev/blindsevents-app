export interface BookingItem {
  id: number;
  ticket_type: number;
  ticket_type_name: string;
  quantity: number;
  unit_price: number;
}

export interface Booking {
  id: number;
  user: number;
  user_name: string;
  event: number;
  event_title?: string;
  event_date: string;
  event_time: string;
  event_location: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  payment_method: 'orange_money' | 'mtn_momo' | 'card' | 'free';
  payment_ref: string;
  phone_number: string;
  total_amount: number;
  items: BookingItem[];
  created_at: string;
}

export interface BookingItemCreate {
  ticket_type_id: number;
  quantity: number;
}

export interface BookingCreate {
  event_id: number;
  payment_method: 'orange_money' | 'mtn_momo' | 'card' | 'free';
  phone_number?: string;
  items: BookingItemCreate[];
}