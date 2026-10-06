import api from './api';

export const subscribeNewsletter = (email) => api.post('/newsletter', { email }).then((r) => r.data);
export const sendContactMessage = (payload) => api.post('/contact', payload).then((r) => r.data);
