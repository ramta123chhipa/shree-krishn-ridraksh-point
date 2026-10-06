import api from './api';

const data = (r) => r.data;
export const register = (body) => api.post('/auth/register', body).then(data);
export const login = (body) => api.post('/auth/login', body).then(data);
export const logout = () => api.post('/auth/logout').then(data);
export const getMe = () => api.get('/auth/me').then((r) => r.data.data);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email }).then(data);
export const resetPassword = (token, password) => api.post('/auth/reset-password', { token, password }).then(data);
export const verifyEmail = (token) => api.post('/auth/verify-email', { token }).then(data);
export const resendVerification = () => api.post('/auth/resend-verification').then(data);
