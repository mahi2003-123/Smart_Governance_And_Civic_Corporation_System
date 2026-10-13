import axios from 'axios';

// ---------------------------------------------------------------------------
// Backend URL resolution
// ---------------------------------------------------------------------------
// VITE_API_BASE_URL is the ONLY source of truth for the backend URL.
// In local dev it defaults to localhost:5000 (see .env.example).
// In production (Vercel) it MUST be set in the Vercel project dashboard.
// ---------------------------------------------------------------------------

const resolveApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const sanitized = envUrl.trim().replace(/\/+$/, '');
    return sanitized.endsWith('/api') ? sanitized : `${sanitized}/api`;
  }

  // Local development fall-through
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:5000/api';
  }

  // Production with missing env var — fail visibly instead of silently
  const msg =
    '[SGCS] VITE_API_BASE_URL is not set. ' +
    'Set this variable in your Vercel project dashboard to the Render backend URL ' +
    '(e.g. https://sgcs-backend.onrender.com). The application cannot function without it.';
  console.error(msg);
  // Throw so the build fails early if this is reached at import time in SSR,
  // or show a meaningful runtime error in the browser console.
  if (typeof window === 'undefined') {
    throw new Error(msg);
  }
  return '__missing_VITE_API_BASE_URL__';
};

export const BASE_URL = resolveApiBaseUrl();
export const isApiBaseUrlMissing = BASE_URL === '__missing_VITE_API_BASE_URL__';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 60000, // 60s — supports Render free-tier cold starts
});

// ---------------------------------------------------------------------------
// Request interceptor — attach JWT bearer token
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    if (isApiBaseUrlMissing) {
      return Promise.reject(
        new Error(
          'VITE_API_BASE_URL is missing. Please configure VITE_API_BASE_URL in your deployment environment.',
        ),
      );
    }
    const token = localStorage.getItem('sgcs_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Response interceptor
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthAttempt =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    // Auto-logout on 401 for non-auth routes
    if (error.response && error.response.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('sgcs_auth_token');
      localStorage.removeItem('sgcs_auth_user');
      localStorage.removeItem('sgcs_user');

      const currentPath = window.location.pathname;
      const isPublicRoute = [
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/',
        '/landing',
      ].includes(currentPath);
      if (!isPublicRoute) {
        window.location.href = '/login';
      }
    }

    // Only log for genuine network loss or server-side 5xx failures
    if (!error.response || error.response.status >= 500) {
      console.error('[SGCS API] Backend error or network failure:', error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
