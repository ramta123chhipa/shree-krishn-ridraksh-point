import api from './api';

const data = (r) => r.data.data;
const page = (r) => r.data; // list endpoints also return { pagination }

// ---------- dashboard ----------
export const getDashboard = () => api.get('/admin/dashboard').then(data);

// ---------- products ----------
export const listProducts = (params) => api.get('/admin/products', { params }).then(page);
export const getProduct = (id) => api.get(`/admin/products/${id}`).then(data);
export const createProduct = (body) => api.post('/products', body).then(data);
export const updateProduct = (id, body) => api.put(`/products/${id}`, body).then(data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data);
export const uploadProductImages = (id, files) => {
  const form = new FormData();
  files.forEach((f) => form.append('images', f));
  return api.post(`/products/${id}/images`, form).then(data);
};
export const deleteProductImage = (id, imageId) => api.delete(`/products/${id}/images/${imageId}`).then(data);
export const makePrimaryImage = (id, imageId) => api.patch(`/products/${id}/images/${imageId}/primary`).then(data);

// ---------- categories ----------
export const listCategories = () => api.get('/admin/categories').then(data);
export const createCategory = (body) => api.post('/categories', body).then(data);
export const updateCategory = (id, body) => api.put(`/categories/${id}`, body).then(data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`).then((r) => r.data);

// ---------- orders ----------
export const listOrders = (params) => api.get('/admin/orders', { params }).then(page);
export const getOrder = (id) => api.get(`/admin/orders/${id}`).then(data);
export const updateOrderStatus = (id, body) => api.patch(`/admin/orders/${id}/status`, body).then(data);
export const refundOrder = (id, amount) => api.post(`/admin/orders/${id}/refund`, { amount }).then(data);

// ---------- customers ----------
export const listCustomers = (params) => api.get('/admin/customers', { params }).then(page);
export const getCustomer = (id) => api.get(`/admin/customers/${id}`).then(data);
export const setCustomerStatus = (id, isActive) => api.patch(`/admin/customers/${id}/status`, { isActive }).then(data);

// ---------- coupons ----------
export const listCoupons = () => api.get('/admin/coupons').then(data);
export const createCoupon = (body) => api.post('/admin/coupons', body).then(data);
export const updateCoupon = (id, body) => api.put(`/admin/coupons/${id}`, body).then(data);
export const deleteCoupon = (id) => api.delete(`/admin/coupons/${id}`).then((r) => r.data);

// ---------- banners (multipart: image + text fields) ----------
export const listBanners = () => api.get('/admin/banners').then(data);
const bannerForm = ({ image, ...fields }) => {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v ?? ''));
  if (image) form.append('image', image);
  return form;
};
export const createBanner = (body) => api.post('/admin/banners', bannerForm(body)).then(data);
export const updateBanner = (id, body) => api.put(`/admin/banners/${id}`, bannerForm(body)).then(data);
export const deleteBanner = (id) => api.delete(`/admin/banners/${id}`).then((r) => r.data);

// ---------- settings ----------
export const getSettings = () => api.get('/admin/settings').then(data);
export const updateSettings = (body) => api.patch('/admin/settings', body).then(data);
