import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CustomThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { isApiBaseUrlMissing } from './services/api';

export const App: React.FC = () => {
  // Proactive background ping to warm up backend health if configured
  React.useEffect(() => {
    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
      if (backendUrl) {
        const cleanBackend = backendUrl.replace(/\/api\/?$/, '');
        fetch(`${cleanBackend}/api/health`).catch(() => {});
      }
    } catch {
      // non-blocking
    }
  }, []);

  if (isApiBaseUrlMissing) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#F9FAFB',
          color: '#111827',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            padding: '32px',
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB',
          }}
        >
          <h2 style={{ color: '#DC2626', marginTop: 0, fontSize: '1.5rem', fontWeight: 700 }}>
            Configuration Error
          </h2>
          <p style={{ color: '#4B5563', lineHeight: 1.6, fontSize: '1rem' }}>
            <strong>VITE_API_BASE_URL</strong> is not configured in this production deployment.
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.5, marginTop: '12px' }}>
            Please set the <code>VITE_API_BASE_URL</code> environment variable in your Vercel project dashboard to point to your deployed backend API URL (e.g. <code>https://your-backend.onrender.com</code>).
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <CustomThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </CustomThemeProvider>
    </BrowserRouter>
  );
};

export default App;
