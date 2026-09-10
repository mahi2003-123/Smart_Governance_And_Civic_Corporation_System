import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { MainLayout } from '../components/layout/MainLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const getDashboardPath = (role?: string) => {
      switch (role?.toUpperCase()) {
        case 'ADMIN':
          return '/admin/dashboard';
        case 'COUNCILLOR':
          return '/councillor/dashboard';
        case 'WORKER':
          return '/worker/dashboard';
        default:
          return '/citizen/dashboard';
      }
    };

    const handlePopState = () => {
      const publicPaths = ['/', '/landing', '/login', '/register', '/forgot-password', '/reset-password'];
      if (publicPaths.includes(window.location.pathname)) {
        navigate(getDashboardPath(user.role), { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <MainLayout>
        <Navigate to="/unauthorized" replace />
      </MainLayout>
    );
  }

  return <MainLayout>{children}</MainLayout>;
};

export default ProtectedRoute;
