import api from './api';
import { User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const res = await api.post('/auth/login', { email: cleanEmail, password: cleanPassword });
      if (res.data && res.data.user) {
        if (res.data.token) {
          localStorage.setItem('sgcs_auth_token', res.data.token);
        }
        return {
          user: res.data.user,
          token: res.data.token || `sgcs_token_${res.data.user.id}`,
        };
      }
      throw new Error('Invalid authentication response from backend server.');
    } catch (err: any) {
      if (err.response && err.response.data) {
        const backendError = err.response.data.error || err.response.data.message;
        if (backendError) {
          throw new Error(backendError);
        }
      }
      if (err.response && err.response.status >= 400 && err.response.status < 500) {
        throw new Error('Invalid email or password.');
      }
      throw new Error('Could not connect to SGCS backend database server.');
    }
  },

  register: async (userData: Partial<User> & { password?: string }): Promise<User> => {
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    const cleanPassword = (userData.password || '').trim();

    try {
      const res = await api.post('/auth/register', {
        fullName: userData.fullName,
        email: cleanEmail,
        password: cleanPassword,
        phone: userData.phone || '',
        ward: userData.ward || 'Ward 1 - Central Town',
        role: userData.role || 'CITIZEN',
      });

      if (res.data && res.data.user) {
        const registeredUser = res.data.user;
        if (res.data.token) {
          localStorage.setItem('sgcs_auth_token', res.data.token);
        }
        return registeredUser;
      }
      throw new Error('Registration failed. Unexpected response from database.');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        throw new Error(err.response.data.error);
      }
      throw new Error(err.message || 'Failed to complete registration in PostgreSQL database.');
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('sgcs_auth_token');
  },

  getProfile: async (): Promise<User | null> => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data) return res.data;
    } catch (err) {
      // Return null on auth profile error
    }
    return null;
  },
};

export default authService;
