import { createContext, useContext, useState } from 'react';
import { MenuItem } from './menu';

export interface CartItem extends MenuItem {
  cartItemId: string;
  quantity: number;
  selectedSize: 'M' | 'L';
  selectedSweetness: string;
  selectedIce: string;
  itemPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (newItem: CartItem) => {
    setItems(prev => {
      // Find if same item with exact config exists
      const existing = prev.find(i => 
        i.id === newItem.id && 
        i.selectedSize === newItem.selectedSize &&
        i.selectedSweetness === newItem.selectedSweetness &&
        i.selectedIce === newItem.selectedIce
      );

      if (existing) {
        return prev.map(i => i.cartItemId === existing.cartItemId 
          ? { ...i, quantity: i.quantity + newItem.quantity }
          : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const totalPrice = items.reduce((acc, i) => acc + (i.itemPrice * i.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
