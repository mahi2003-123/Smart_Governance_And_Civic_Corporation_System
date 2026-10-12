import axios from 'axios';

// Resolves base API URL, defaulting to production Render backend if unset
const resolveApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const sanitized = envUrl.trim().replace(/\/+$/, '');
    return sanitized.endsWith('/api') ? sanitized : `${sanitized}/api`;
  }
  return 'https://smart-governance-and-civic-corporation.onrender.com/api';
};

const BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 60000, // 60s timeout to gracefully support Render free-tier instance cold starts
});

// Request interceptor to attach bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sgcs_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthAttempt = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (error.response && error.response.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('sgcs_auth_token');
      localStorage.removeItem('sgcs_auth_user');
      localStorage.removeItem('sgcs_user');

      const currentPath = window.location.pathname;
      const isPublicRoute = ['/login', '/register', '/forgot-password', '/reset-password', '/', '/landing'].includes(currentPath);
      if (!isPublicRoute) {
        window.location.href = '/login';
      }
    }
    console.warn('[SGCS API Interceptor] Live backend error or offline. Falling back gracefully.', error.message);
    return Promise.reject(error);
  }
);

export default api;
