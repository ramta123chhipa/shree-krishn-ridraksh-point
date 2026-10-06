import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as cartService from '../services/cartService';
import { useAuth } from '../hooks/useAuth';

export const CartContext = createContext(null);

const EMPTY = { items: [], itemCount: 0, subtotal: 0, hasIssues: false };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  // Load the cart when someone logs in, clear it when they log out
  useEffect(() => {
    if (!user) { setCart(EMPTY); return; }
    let cancelled = false;
    setLoading(true);
    cartService.getCart().then((c) => !cancelled && setCart(c)).catch(() => {}).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [user]);

  // Each action throws on failure (e.g. "Only 3 available"); callers show the message.
  const addItem = useCallback(async (productId, variantId, qty) => setCart(await cartService.addToCart(productId, variantId, qty)), []);
  const updateItem = useCallback(async (productId, variantId, qty) => setCart(await cartService.updateCartItem(productId, variantId, qty)), []);
  const removeItem = useCallback(async (productId, variantId) => setCart(await cartService.removeCartItem(productId, variantId)), []);

  // Re-reads the cart from the server (after an order clears it)
  const reload = useCallback(async () => setCart(await cartService.getCart()), []);

  const value = useMemo(() => ({ cart, loading, addItem, updateItem, removeItem, reload }), [cart, loading, addItem, updateItem, removeItem, reload]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
