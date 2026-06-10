export interface TicketTypeStat {
  ticket_type__name: string;
  ticket_type__price: number;
  total_qty: number;
  total_revenue: number;
}

export interface EventStats {
  event_id: number;
  event_title: string;
  total_bookings: number;
  total_sold: number;
  total_revenue: number;
  available_spots: number;
  fill_rate: number;
  by_ticket_type: TicketTypeStat[];
}

export interface DashboardStats {
  total_events: number;
  active_events: number;
  total_bookings: number;
  total_revenue: number;
  total_sold: number;
}