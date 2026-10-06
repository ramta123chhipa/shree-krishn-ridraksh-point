import api from './api';

// Every call returns the full, freshly priced cart.
const cart = (r) => r.data.data;
export const getCart = () => api.get('/cart').then(cart);
export const addToCart = (productId, variantId, quantity = 1) => api.post('/cart/add', { productId, variantId, quantity }).then(cart);
export const updateCartItem = (productId, variantId, quantity) => api.put('/cart/update', { productId, variantId, quantity }).then(cart);
export const removeCartItem = (productId, variantId) =>
  api.delete(`/cart/remove/${productId}`, { params: variantId ? { variantId } : {} }).then(cart);
