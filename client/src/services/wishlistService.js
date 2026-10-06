import api from './api';

export const getWishlist = () => api.get('/wishlist').then((r) => r.data.data);
export const addToWishlist = (productId) => api.post('/wishlist', { productId }).then((r) => r.data.data);
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`).then((r) => r.data.data);
