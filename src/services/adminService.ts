import api from './api';
import { User, Ward, CivicAnalytics } from '../types';

const LOCAL_USERS_KEY = 'sgcs_registered_users';

const getLocalUsers = (): User[] => {
  try {
    const data = localStorage.getItem(LOCAL_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const adminService = {
  getAnalytics: async (): Promise<CivicAnalytics> => {
    try {
      const res = await api.get('/admin/analytics');
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    return {
      totalComplaints: 0,
      pendingComplaints: 0,
      inProgressComplaints: 0,
      resolvedComplaints: 0,
      totalProposals: 0,
      activeNotices: 2,
      categoryBreakdown: [],
      monthlyTrends: []
    };
  },

  getUsers: async (): Promise<User[]> => {
    let apiUsers: User[] = [];
    try {
      const res = await api.get('/admin/users');
      if (res.data) {
        apiUsers = res.data;
      }
    } catch (err) {
      // API Offline fallback
    }

    const localUsers = getLocalUsers();
    // Combine API users and local users without duplicates by email
    const combinedMap = new Map<string, User>();
    apiUsers.forEach((u) => combinedMap.set(u.email.toLowerCase(), u));
    localUsers.forEach((u) => {
      if (!combinedMap.has(u.email.toLowerCase())) {
        combinedMap.set(u.email.toLowerCase(), u);
      }
    });

    return Array.from(combinedMap.values());
  },

  createUser: async (userData: {
    fullName: string;
    email: string;
    password?: string;
    phone?: string;
    role: 'CITIZEN' | 'COUNCILLOR' | 'WORKER' | 'ADMIN';
    ward?: string;
  }): Promise<User> => {
    try {
      const res = await api.post('/admin/users', userData);
      if (res.data) return res.data;
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        throw new Error(err.response.data.error);
      }
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role,
      ward: userData.ward || 'Ward 1 - Central Town',
      createdAt: new Date().toISOString(),
    };

    // Store in local users cache
    const existing = getLocalUsers();
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([newUser, ...existing]));

    return newUser;
  },

  getWards: async (): Promise<Ward[]> => {
    try {
      const res = await api.get('/admin/wards');
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }
    return [];
  },

  createWard: async (wardData: Omit<Ward, 'id' | 'activeComplaints' | 'resolvedComplaints'>): Promise<Ward> => {
    try {
      const res = await api.post('/admin/wards', wardData);
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    return {
      ...wardData,
      id: `w_${Date.now()}`,
      activeComplaints: 0,
      resolvedComplaints: 0
    };
  }
};
