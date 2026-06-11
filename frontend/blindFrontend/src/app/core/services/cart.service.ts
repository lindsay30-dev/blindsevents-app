import { Injectable, signal } from '@angular/core';

export interface CartItem {
  eventId: string;
  ticketType: string;
  price: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<CartItem[]>([]);

  addItem(item: CartItem) {
    const existing = this.items().find(i => i.eventId === item.eventId && i.ticketType === item.ticketType);
    if (existing) {
      existing.quantity += item.quantity;
      this.items.set([...this.items()]);
    } else {
      this.items.set([...this.items(), { ...item, quantity: item.quantity || 1 }]);
    }
  }

  removeItem(index: number) {
    const newItems = [...this.items()];
    newItems.splice(index, 1);
    this.items.set(newItems);
  }

  clear() {
    this.items.set([]);
  }

  getTotal(): number {
    return this.items().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}
