import { create } from 'zustand';
import { CartItem, MenuOption } from './types';
import type { Order } from '@workspace/api-client-react';

const CART_STORAGE_KEY = 'cgv_cart_v2';

interface AppState {
  cart: CartItem[];
  delivery: DeliveryDetails;
  lastOrder: Order | null;
  addToCart: (
    item: Omit<CartItem, 'id' | 'qty' | 'menuItemId' | 'selectedOption'> & {
      menuItemId: string;
      separateLine?: boolean;
    },
  ) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  setCartOption: (id: string, option: MenuOption | null) => void;
  clearCart: () => void;
  setDelivery: (delivery: DeliveryDetails) => void;
  clearDelivery: () => void;
  setLastOrder: (order: Order) => void;
  clearLastOrder: () => void;
}

export interface DeliveryDetails {
  seatNumber: string;
  auditorium: string;
  customerName: string;
}

export const useAppStore = create<AppState>((set) => {
  let initialCart: CartItem[] = [];
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) initialCart = JSON.parse(savedCart);
  } catch (e) {}

  return {
    cart: initialCart,
    delivery: { seatNumber: '', auditorium: '', customerName: '' },
    lastOrder: null,

    addToCart: (item) => set((state) => {
      const { separateLine = false, ...cartItem } = item;
      const existing = separateLine
        ? undefined
        : state.cart.find(c => (c.menuItemId ?? c.id) === item.menuItemId);
      let newCart: CartItem[];
      if (existing) {
        newCart = state.cart.map(c => c.id === existing.id ? { ...c, qty: c.qty + 1 } : c);
      } else {
        const id = separateLine
          ? `${item.menuItemId}-${crypto.randomUUID()}`
          : item.menuItemId;
        newCart = [...state.cart, { ...cartItem, id, qty: 1 }];
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
      return { cart: newCart };
    }),

    removeFromCart: (id) => set((state) => {
      const newCart = state.cart.filter(c => c.id !== id);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
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
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
      return { cart: newCart };
    }),

    setCartOption: (id, option) => set((state) => {
      const newCart = state.cart.map(c => {
        if (c.id === id) {
          const updated = { ...c };
          if (option) updated.selectedOption = option;
          else delete updated.selectedOption;
          return updated;
        }
        return c;
      });
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
      return { cart: newCart };
    }),

    clearCart: () => set(() => {
      localStorage.removeItem(CART_STORAGE_KEY);
      return { cart: [] };
    }),

    setDelivery: (delivery) => set(() => ({ delivery })),
    clearDelivery: () => set(() => ({
      delivery: { seatNumber: '', auditorium: '', customerName: '' },
    })),
    setLastOrder: (order) => set({ lastOrder: order }),
    clearLastOrder: () => set({ lastOrder: null }),
  };
});
