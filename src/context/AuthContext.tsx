import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';

export const SUPER_ADMIN_USER: User = {
  id: 'usr_super_admin',
  fullName: 'Super Admin',
  email: 'admin@gnail.com',
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
  updateProfile: (updatedData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => SUPER_ADMIN_USER,
  register: async () => SUPER_ADMIN_USER,
  logout: () => {},
  updateProfile: () => {},
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
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('sgcs_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sgcs_auth_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authService.login(email, password);
    setUser(res.user);
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
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
