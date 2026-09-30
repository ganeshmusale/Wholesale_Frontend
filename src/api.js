import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wholesale_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      // Only clear token & reload if 401 happened on an authenticated route, not login/register
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        if (localStorage.getItem('wholesale_token')) {
          localStorage.removeItem('wholesale_token');
          localStorage.removeItem('wholesale_user');
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
