import { create } from 'zustand';
import { CartItem } from './types';

interface AppState {
  cart: CartItem[];
  delivery: DeliveryDetails;
  addToCart: (item: Omit<CartItem, 'qty'>) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  clearCart: () => void;
  setDelivery: (delivery: DeliveryDetails) => void;
  clearDelivery: () => void;
}

export interface DeliveryDetails {
  seatNumber: string;
  auditorium: string;
  customerName: string;
}

export const useAppStore = create<AppState>((set) => {
  let initialCart: CartItem[] = [];
  try {
    const savedCart = localStorage.getItem('cgv_cart');
    if (savedCart) initialCart = JSON.parse(savedCart);
  } catch (e) {}

  return {
    cart: initialCart,
    delivery: { seatNumber: '', auditorium: '', customerName: '' },

    addToCart: (item) => set((state) => {
      const existing = state.cart.find(c => c.id === item.id);
      let newCart;
      if (existing) {
        newCart = state.cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      } else {
        newCart = [...state.cart, { ...item, qty: 1 }];
      }
      localStorage.setItem('cgv_cart', JSON.stringify(newCart));
      return { cart: newCart };
    }),

    removeFromCart: (id) => set((state) => {
      const newCart = state.cart.filter(c => c.id !== id);
      localStorage.setItem('cgv_cart', JSON.stringify(newCart));
      return { cart: newCart };
    }),

    updateQty: (id, delta) => set((state) => {
      const newCart = state.cart.map(c => {
        if (c.id === id) {
          const newQty = Math.max(1, c.qty + delta);
          return { ...c, qty: newQty };
        }
        return c;
      });
      localStorage.setItem('cgv_cart', JSON.stringify(newCart));
      return { cart: newCart };
    }),

    clearCart: () => set(() => {
      localStorage.removeItem('cgv_cart');
      return { cart: [] };
    }),

    setDelivery: (delivery) => set(() => ({ delivery })),
    clearDelivery: () => set(() => ({
      delivery: { seatNumber: '', auditorium: '', customerName: '' },
    })),
  };
});
