import api from './api';
import { User } from '../types';
import { SUPER_ADMIN_USER } from '../context/AuthContext';

const LOCAL_USERS_KEY = 'sgcs_registered_users';

const getStoredUsers = (): any[] => {
  try {
    const data = localStorage.getItem(LOCAL_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveUserToLocalStorage = (user: any) => {
  try {
    const existing = getStoredUsers();
    const filtered = existing.filter(
      (u) => u.email.toLowerCase() !== user.email.toLowerCase()
    );
    const updated = [user, ...filtered];
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving user to localStorage:', e);
  }
};

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const res = await api.post('/auth/login', { email: cleanEmail, password: cleanPassword });
      if (res.data && res.data.user) {
        saveUserToLocalStorage(res.data.user);
        return {
          user: res.data.user,
          token: res.data.token || `sgcs_token_${res.data.user.id}`,
        };
      }
    } catch (err: any) {
      // 1. If backend server responded (HTTP 4xx/5xx), strictly enforce database response
      if (err.response) {
        if (err.response.data && err.response.data.error) {
          throw new Error(err.response.data.error);
        }
        if (err.response.status === 401 || err.response.status === 400 || err.response.status === 404) {
          throw new Error('Invalid email or password. Account not registered in SGCS database.');
        }
      }

      // 2. Only if backend is completely offline/unreachable, attempt offline local lookup
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || !err.response) {
        const localUsers = getStoredUsers();
        const found = localUsers.find((u) => u.email.toLowerCase() === cleanEmail);
        if (found) {
          if (found.password && found.password !== cleanPassword) {
            throw new Error('Incorrect password.');
          }
          return {
            user: found,
            token: `sgcs_token_${found.id}`,
          };
        }

        // Default Super Admin credentials fallback check
        if (cleanEmail === 'admin@gnail.com' || cleanEmail === 'admin@gmail.com') {
          if (cleanPassword === 'admin12345' || cleanPassword === 'admin123') {
            return {
              user: { ...SUPER_ADMIN_USER, email: cleanEmail },
              token: 'sgcs_jwt_token_usr_super_admin',
            };
          } else {
            throw new Error('Incorrect password. Default Super Admin password is admin12345');
          }
        }

        throw new Error('Backend API server unreachable (Network Error). Please check connection to http://localhost:5000');
      }

      throw new Error(err.message || 'Invalid email or password. Please check your credentials.');
    }

    throw new Error('Unable to authenticate with server.');
  },

  register: async (userData: Partial<User> & { password?: string }): Promise<User> => {
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    const cleanPassword = (userData.password || '').trim();

    const newLocalUser: User & { password?: string } = {
      id: `usr_${Date.now()}`,
      fullName: userData.fullName || 'New Resident',
      email: userData.email || cleanEmail,
      phone: userData.phone || '',
      role: userData.role || 'CITIZEN',
      ward: userData.ward || 'Ward 1 - Central Town',
      createdAt: new Date().toISOString(),
      password: cleanPassword,
    };

    try {
      const res = await api.post('/auth/register', {
        fullName: userData.fullName,
        email: cleanEmail,
        password: cleanPassword,
        phone: userData.phone,
        ward: userData.ward,
        role: userData.role || 'CITIZEN',
      });

      if (res.data && res.data.user) {
        const registeredUser = { ...res.data.user, password: cleanPassword };
        if (res.data.token) {
          localStorage.setItem('sgcs_auth_token', res.data.token);
        }
        saveUserToLocalStorage(registeredUser);
        return registeredUser;
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.data && err.response.data.error) {
          throw new Error(err.response.data.error);
        }
        throw new Error('Registration failed. Please check your details.');
      }
      console.warn('[authService] Backend API registration offline. Storing account locally.');
    }

    // Save locally if offline or fallback needed
    saveUserToLocalStorage(newLocalUser);
    localStorage.setItem('sgcs_auth_token', `sgcs_token_${newLocalUser.id}`);
    return newLocalUser;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('sgcs_auth_token');
  },

  getProfile: async (): Promise<User | null> => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }
    return null;
  },
};
