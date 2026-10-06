import api from './api';

export const updateProfile = (body) => api.put('/users/profile', body).then((r) => r.data.data);
export const changePassword = (body) => api.put('/users/password', body).then((r) => r.data);
export const getAddresses = () => api.get('/users/addresses').then((r) => r.data.data);
export const addAddress = (body) => api.post('/users/addresses', body).then((r) => r.data.data);
export const updateAddress = (id, body) => api.put(`/users/addresses/${id}`, body).then((r) => r.data.data);
export const deleteAddress = (id) => api.delete(`/users/addresses/${id}`).then((r) => r.data);
