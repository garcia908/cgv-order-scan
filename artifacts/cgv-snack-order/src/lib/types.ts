export type Category = 'Combo' | 'Popcorn' | 'Snack' | 'Minuman';

export interface MenuOption {
  label: string;
  additionalPrice?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number | null;
  category: Category;
  image: string;
  options?: MenuOption[];
  optionsLabel?: string;
}

export interface CartItem {
  id: string;
  menuItemId?: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  selectedOption?: MenuOption;
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
