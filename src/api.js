import axios from 'axios';

// Dynamically determine the backend API base URL:
// - If running locally (localhost, 127.0.0.1, LAN IP): connects to local backend (http://localhost:5000/api)
// - If deployed on wholesale.bhoopreet.com or any production domain: connects to live backend (https://backsale.bhoopreet.com/api)
export const getApiBaseUrl = () => {
  // If explicitly overridden via Vite environment variable (e.g., VITE_API_URL)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Runtime detection based on the current browser hostname
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const isLocal =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.local') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname === '';

    if (isLocal) {
      return `http://${hostname === 'localhost' || hostname === '' ? 'localhost' : hostname}:5000/api`;
    }
  }

  // Deployed production backend URL
  return 'https://backsale.bhoopreet.com/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
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
