import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';
import { autoRegisterFCMToken } from '../utils/firebase';

export const SUPER_ADMIN_USER: User = {
  id: 'usr_super_admin',
  fullName: 'Super Admin',
  email: 'admin@gmail.com',
  phone: '+91 99000 11223',
  role: 'ADMIN',
  ward: 'All Wards',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
  createdAt: '2025-08-01T00:00:00Z',
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: Partial<User> & { password?: string }) => Promise<User>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => SUPER_ADMIN_USER,
  register: async () => SUPER_ADMIN_USER,
  logout: () => {},
  updateProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sgcs_auth_user');
    const token = localStorage.getItem('sgcs_auth_token');
    if (saved && token) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Clean up orphaned session data if token is absent
    if (!token && saved) {
      localStorage.removeItem('sgcs_auth_user');
      localStorage.removeItem('sgcs_user');
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('sgcs_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sgcs_auth_user');
      localStorage.removeItem('sgcs_user');
    }
  }, [user]);

  // Auto-register FCM token for push notifications on app load when user is logged in
  useEffect(() => {
    if (user && localStorage.getItem('sgcs_auth_token')) {
      autoRegisterFCMToken().catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const login = async (email: string, password: string): Promise<User> => {
    const res = await authService.login(email, password);
    setUser(res.user);
    // Auto-register FCM token for push notifications after login
    autoRegisterFCMToken().catch(() => {});
    return res.user;
  };

  const register = async (userData: Partial<User> & { password?: string }): Promise<User> => {
    const newUser = await authService.register(userData);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sgcs_auth_user');
    localStorage.removeItem('sgcs_auth_token');
    localStorage.removeItem('sgcs_user');
  };

  const updateProfile = async (updatedData: Partial<User>) => {
    if (user) {
      const updatedUser = await authService.updateProfile(updatedData);
      setUser(updatedUser);
      localStorage.setItem('sgcs_auth_user', JSON.stringify(updatedUser));
    }
  };

  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('sgcs_auth_token') : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && hasToken,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
