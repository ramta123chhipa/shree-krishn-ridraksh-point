import api from './api';

// Drop empty values so the URL stays clean
const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null && v !== false));

export const getProducts = (params) => api.get('/products', { params: clean(params) }).then((r) => r.data);
export const getProduct = (slug) => api.get(`/products/${slug}`).then((r) => r.data.data);
export const getSuggestions = (q) => api.get('/products/suggestions', { params: { q } }).then((r) => r.data.data);
export const getCategories = () => api.get('/categories').then((r) => r.data.data);
