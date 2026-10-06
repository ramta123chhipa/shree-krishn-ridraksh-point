import { useEffect, useState } from 'react';

const KEY = 'srp_recently_viewed';
const MAX = 8;

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

// Remembers the products a visitor opened (stored in their browser only).
export function useRecentlyViewed(product) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!product) return;
    const mini = {
      _id: product._id, slug: product.slug, name: product.name, price: product.price,
      discountPrice: product.discountPrice, stock: product.stock, images: product.images?.slice(0, 1),
      ratings: product.ratings, category: product.category && { name: product.category.name, slug: product.category.slug },
    };
    const list = [mini, ...read().filter((p) => p._id !== product._id)].slice(0, MAX + 1);
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage unavailable */ }
    setItems(list.filter((p) => p._id !== product._id).slice(0, 4));
  }, [product]);

  return items;
}
