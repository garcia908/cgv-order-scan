import { create } from 'zustand';
import { CartItem, Order } from './types';

// Seed demo orders for staff view
const initialOrders: Order[] = (() => {
  try {
    const existing = localStorage.getItem('cgv_orders');
    if (existing) {
      return JSON.parse(existing);
    }
  } catch (e) {}

  const demoOrders: Order[] = [
    {
      id: 'CGV-20240501-0001',
      createdAt: Date.now() - 1000 * 60 * 15,
      table: 'Meja B04',
      items: [
        { id: 'combo-1', name: 'CGV Combo Solo', price: 55000, qty: 1, image: '' }
      ],
      subtotal: 55000,
      total: 55000,
      paymentMethod: 'QRIS',
      status: 'baru'
    },
    {
      id: 'CGV-20240501-0002',
      createdAt: Date.now() - 1000 * 60 * 45,
      table: 'Meja C12',
      items: [
        { id: 'popcorn-1', name: 'Popcorn Caramel Regular', price: 35000, qty: 2, image: '' },
        { id: 'minuman-1', name: 'Coca-Cola Medium', price: 22000, qty: 2, image: '' }
      ],
      subtotal: 114000,
      total: 114000,
      paymentMethod: 'VA_BCA',
      status: 'disiapkan'
    }
  ];
  localStorage.setItem('cgv_orders', JSON.stringify(demoOrders));
  return demoOrders;
})();

interface AppState {
  cart: CartItem[];
  tableNumber: string;
  orders: Order[];
  addToCart: (item: Omit<CartItem, 'qty'>) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  clearCart: () => void;
  setTableNumber: (table: string) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  clearAllOrders: () => void;
}

export const useAppStore = create<AppState>((set) => {
  // Load initial cart
  let initialCart: CartItem[] = [];
  try {
    const savedCart = localStorage.getItem('cgv_cart');
    if (savedCart) initialCart = JSON.parse(savedCart);
  } catch (e) {}

  return {
    cart: initialCart,
    tableNumber: 'Meja A12',
    orders: initialOrders,

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

    setTableNumber: (table) => set(() => ({ tableNumber: table })),

    addOrder: (order) => set((state) => {
      const newOrders = [order, ...state.orders];
      localStorage.setItem('cgv_orders', JSON.stringify(newOrders));
      return { orders: newOrders };
    }),

    updateOrderStatus: (id, status) => set((state) => {
      const newOrders = state.orders.map(o => o.id === id ? { ...o, status } : o);
      localStorage.setItem('cgv_orders', JSON.stringify(newOrders));
      return { orders: newOrders };
    }),

    clearAllOrders: () => set(() => {
      localStorage.removeItem('cgv_orders');
      return { orders: [] };
    })
  };
});
