import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  type: 'test' | 'scan' | 'package';
  name: string;
  price: number;
  originalPrice?: number;
  diagnosticCenterId: string;
  diagnosticCenterName: string;
  reportDeliveryTime: string;
  quantity: number;
  testsIncluded?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string, diagnosticCenterId: string) => void;
  updateQuantity: (id: string, diagnosticCenterId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(
          (i) => i.id === item.id && i.diagnosticCenterId === item.diagnosticCenterId
        );

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === item.id && i.diagnosticCenterId === item.diagnosticCenterId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }
      },

      removeItem: (id, diagnosticCenterId) => {
        set({
          items: get().items.filter(
            (i) => !(i.id === id && i.diagnosticCenterId === diagnosticCenterId)
          ),
        });
      },

      updateQuantity: (id, diagnosticCenterId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id, diagnosticCenterId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id && i.diagnosticCenterId === diagnosticCenterId
              ? { ...i, quantity }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'lablink-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
