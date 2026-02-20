/* =====================================================
   Charlie Marketplace Builder — Cart Context (localStorage persisted)
   ===================================================== */
import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string; // e.g. "Talle M / Azul"
}

interface CartState { items: CartItem[] }

type CartAction =
  | { type: 'ADD'; payload: CartItem }
  | { type: 'REMOVE'; payload: string }
  | { type: 'SET_QTY'; payload: { id: string; qty: number } }
  | { type: 'CLEAR' };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const exists = state.items.find(i => i.id === action.payload.id);
      if (exists) {
        return { items: state.items.map(i => i.id === action.payload.id ? { ...i, quantity: i.quantity + action.payload.quantity } : i) };
      }
      return { items: [...state.items, action.payload] };
    }
    case 'REMOVE':
      return { items: state.items.filter(i => i.id !== action.payload) };
    case 'SET_QTY':
      if (action.payload.qty <= 0)
        return { items: state.items.filter(i => i.id !== action.payload.id) };
      return { items: state.items.map(i => i.id === action.payload.id ? { ...i, quantity: action.payload.qty } : i) };
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

interface CartCtx {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] }, (init) => {
    try {
      const s = localStorage.getItem('charlie-cart');
      return s ? (JSON.parse(s) as CartState) : init;
    } catch { return init; }
  });

  useEffect(() => {
    localStorage.setItem('charlie-cart', JSON.stringify(state));
  }, [state]);

  const ctx: CartCtx = {
    items: state.items,
    addItem: (item) => dispatch({ type: 'ADD', payload: item }),
    removeItem: (id) => dispatch({ type: 'REMOVE', payload: id }),
    setQty: (id, qty) => dispatch({ type: 'SET_QTY', payload: { id, qty } }),
    clearCart: () => dispatch({ type: 'CLEAR' }),
    totalItems: state.items.reduce((s, i) => s + i.quantity, 0),
    subtotal: state.items.reduce((s, i) => s + i.price * i.quantity, 0),
  };

  return <CartContext.Provider value={ctx}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart requires CartProvider');
  return ctx;
}