import { useEffect, useState } from 'react';
import { getCategories, getProducts } from '../services/productService';

// Fetches a product list whenever `params` change.
export function useProducts(params) {
  const key = JSON.stringify(params);
  const [state, setState] = useState({ products: [], pagination: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    getProducts(JSON.parse(key))
      .then(({ data, pagination }) => !cancelled && setState({ products: data, pagination, loading: false, error: null }))
      .catch((err) => !cancelled && setState({ products: [], pagination: null, loading: false, error: err.message }));
    return () => { cancelled = true; };
  }, [key]);

  return state;
}

export function useCategories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    let cancelled = false;
    getCategories().then((d) => !cancelled && setCategories(d)).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return { categories };
}
