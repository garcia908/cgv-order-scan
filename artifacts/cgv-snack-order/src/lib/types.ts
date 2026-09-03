export type Category = 'Combo' | 'Popcorn' | 'Snack' | 'Minuman';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export interface Order {
  id: string;
  createdAt: number;
  seatNumber: string;
  auditorium: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  paymentMethod: 'CASH' | 'QRIS' | 'DEBIT';
  status: 'baru' | 'disiapkan' | 'selesai';
}
