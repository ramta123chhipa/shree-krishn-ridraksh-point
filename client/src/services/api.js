import axios from 'axios';

// Single axios instance used by every service file.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // send the httpOnly login cookie
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // A 401 outside the auth screens means the session ended: let AuthContext log the user out.
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(new Error(error.response?.data?.message || error.message || 'Network error'));
  }
);

export default api;
