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
  table: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  paymentMethod: 'QRIS' | 'VA_BCA' | 'VA_MANDIRI';
  status: 'baru' | 'disiapkan' | 'selesai';
}
