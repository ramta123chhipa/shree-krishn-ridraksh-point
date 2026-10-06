import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as wishlistService from '../services/wishlistService';
import { useAuth } from '../hooks/useAuth';

export const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setItems([]); return; }
    let cancelled = false;
    setLoading(true);
    wishlistService.getWishlist().then((d) => !cancelled && setItems(d)).catch(() => {}).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [user]);

  const ids = useMemo(() => new Set(items.map((p) => p._id)), [items]);
  const has = useCallback((id) => ids.has(id), [ids]);
  const add = useCallback(async (id) => setItems(await wishlistService.addToWishlist(id)), []);
  const remove = useCallback(async (id) => setItems(await wishlistService.removeFromWishlist(id)), []);

  const value = useMemo(() => ({ items, loading, has, add, remove }), [items, loading, has, add, remove]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
