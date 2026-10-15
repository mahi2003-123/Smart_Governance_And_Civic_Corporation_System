import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CustomThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  // Proactive background ping to warm up backend and AI service on initial load
  React.useEffect(() => {
    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const cleanBackend = backendUrl.replace(/\/api\/?$/, '');
      fetch(`${cleanBackend}/api/health`).catch(() => {});
      fetch('https://smart-governance-and-civic-corporation-7q2c.onrender.com/health', { mode: 'no-cors' }).catch(() => {});
    } catch {
      // non-blocking
    }
  }, []);

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
