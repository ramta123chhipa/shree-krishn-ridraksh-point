import api from './api';

export const getPublicSettings = () => api.get('/settings/public').then((r) => r.data.data);
