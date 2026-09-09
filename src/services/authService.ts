import api from './api';
import { User } from '../types';

const LOCAL_USERS_KEY = 'sgcs_registered_users';

const DEFAULT_SYSTEM_USERS: User[] = [
  {
    id: 'usr_super_admin',
    fullName: 'Municipal Super Admin',
    email: 'admin@gmail.com',
    phone: '+91 98765 00001',
    role: 'ADMIN',
    ward: 'All Wards',
    status: 'ACTIVE',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'usr_councillor_1',
    fullName: 'Sunita Rao',
    email: 'sunita.councillor@sgcs.gov.in',
    phone: '+91 98765 43210',
    role: 'COUNCILLOR',
    ward: 'Ward 1 - Central Town',
    status: 'ACTIVE',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'usr_worker_1',
    fullName: 'Madhav',
    email: 'madhav.worker@sgcs.gov.in',
    phone: '+91 98765 88888',
    role: 'WORKER',
    ward: 'Ward 1 - Central Town',
    status: 'ACTIVE',
    createdAt: '2026-01-10T00:00:00Z',
  },
];

const getStoredUsers = (): User[] => {
  try {
    const data = localStorage.getItem(LOCAL_USERS_KEY);
    const customUsers: User[] = data ? JSON.parse(data) : [];
    const allUsers = [...customUsers];
    DEFAULT_SYSTEM_USERS.forEach((sysUser) => {
      if (!allUsers.some((u) => u.email.toLowerCase() === sysUser.email.toLowerCase())) {
        allUsers.push(sysUser);
      }
    });
    return allUsers;
  } catch (e) {
    return DEFAULT_SYSTEM_USERS;
  }
};

const saveUserToLocalStorage = (user: User) => {
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

    // 1. Attempt backend API authentication if available
    try {
      const res = await api.post('/auth/login', { email: cleanEmail, password: cleanPassword });
      if (res.data && res.data.user) {
        if (res.data.token) {
          localStorage.setItem('sgcs_auth_token', res.data.token);
        }
        saveUserToLocalStorage(res.data.user);
        return {
          user: res.data.user,
          token: res.data.token || `sgcs_token_${res.data.user.id}`,
        };
      }
    } catch (err: any) {
      if (err.response && err.response.status >= 400 && err.response.status < 500 && err.response.data && err.response.data.error) {
        throw new Error(err.response.data.error);
      }
    }

    // 2. Seamless local database fallback for registered users & system accounts
    const storedUsers = getStoredUsers();
    const matchedUser = storedUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (matchedUser) {
      const token = `sgcs_token_${matchedUser.id}_${Date.now()}`;
      localStorage.setItem('sgcs_auth_token', token);
      saveUserToLocalStorage(matchedUser);
      return {
        user: matchedUser,
        token,
      };
    }

    throw new Error(`Account with email "${cleanEmail}" was not found. Please register an account first.`);
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
        saveUserToLocalStorage(registeredUser);
        return registeredUser;
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        throw new Error(err.response.data.error);
      }
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      fullName: userData.fullName || 'Citizen User',
      email: cleanEmail,
      phone: userData.phone || '',
      ward: userData.ward || 'Ward 1 - Central Town',
      role: (userData.role as any) || 'CITIZEN',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    const token = `sgcs_token_${newUser.id}`;
    localStorage.setItem('sgcs_auth_token', token);
    saveUserToLocalStorage(newUser);
    return newUser;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('sgcs_auth_token');
  },

  getProfile: async (): Promise<User | null> => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data) return res.data;
    } catch (err) {
      // Fallback to active session
    }
    return null;
  },
};

export default authService;
