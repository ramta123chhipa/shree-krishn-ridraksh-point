import api from './api';

export const getQuote = (couponCode) => api.post('/orders/quote', { couponCode: couponCode || undefined }).then((r) => r.data.data);
export const createOrder = (body) => api.post('/orders', body).then((r) => r.data.data);
export const getMyOrders = () => api.get('/orders/my-orders').then((r) => r.data.data);
export const getOrder = (id) => api.get(`/orders/${id}`).then((r) => r.data.data);
export const cancelOrder = (id) => api.patch(`/orders/${id}/cancel`).then((r) => r.data.data);
export const requestReturn = (id, reason) => api.post(`/orders/${id}/return`, { reason }).then((r) => r.data.data);
