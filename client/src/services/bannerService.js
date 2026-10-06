import api from './api';

export const getBanners = () => api.get('/banners').then((r) => r.data.data);
