import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
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

    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
};

export default PublicOnlyRoute;
