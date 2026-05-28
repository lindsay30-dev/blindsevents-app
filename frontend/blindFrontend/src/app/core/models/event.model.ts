export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface TicketType {
  id: number;
  name: string;
  price: number;
  quantity: number;
  remaining: number;
  sale_start: string | null;
  sale_end: string | null;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  capacity: number;
  status: 'draft' | 'published' | 'cancelled' | 'ended';
  image: string | null;
  is_online: boolean;
  online_link: string | null;
  category: Category;
  organizer: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  ticket_types: TicketType[];
  tickets_sold: number;
  available_spots: number;
  min_price: number;
  created_at: string;
  updated_at: string;
}

export interface EventFilters {
  category?: string;
  search?: string;
  is_online?: boolean;
}
