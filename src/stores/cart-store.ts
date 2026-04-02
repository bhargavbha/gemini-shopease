import { create } from 'zustand';

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  [key: string]: unknown;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  cartId: string | null;
  setItems: (items: CartItem[]) => void;
  setCartId: (id: string) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  cartId: null,

  setItems: (items) => set({ items }),
  setCartId: (id) => set({ cartId: id }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
