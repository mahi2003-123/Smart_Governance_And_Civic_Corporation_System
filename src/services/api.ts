import axios from 'axios';

// Resolves base API URL, supporting VITE_API_BASE_URL with or without trailing /api
const resolveApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const sanitized = envUrl.trim().replace(/\/+$/, '');
    return sanitized.endsWith('/api') ? sanitized : `${sanitized}/api`;
  }
  return `http://${window.location.hostname}:5000/api`;
};

const BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
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
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('sgcs_auth_token');
      localStorage.removeItem('sgcs_user');
      window.location.href = '/login';
    }
    console.warn('[SGCS API Interceptor] Live backend error or offline. Falling back gracefully.', error.message);
    return Promise.reject(error);
  }
);

export default api;
