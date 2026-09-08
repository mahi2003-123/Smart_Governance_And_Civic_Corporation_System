import api from './api';
import { User, Ward, CivicAnalytics, SystemActivityLog, NotificationItem } from '../types';

const LOCAL_USERS_KEY = 'sgcs_registered_users';

const MOCK_USERS: User[] = [
  { id: 'usr_super_admin', fullName: 'Municipal Super Admin', email: 'admin@gmail.com', phone: '+91 98765 00001', role: 'ADMIN', ward: 'All Wards', status: 'ACTIVE', createdAt: '2026-01-10' },
];

const MOCK_WARDS: Ward[] = [
  { id: 'w_1', wardNumber: 1, name: 'Ward 1 - Central Town', councillorName: 'Unassigned', councillorEmail: '', population: 45000, activeComplaints: 0, resolvedComplaints: 0 },
  { id: 'w_2', wardNumber: 2, name: 'Ward 2 - Riverside North', councillorName: 'Unassigned', councillorEmail: '', population: 38000, activeComplaints: 0, resolvedComplaints: 0 },
  { id: 'w_3', wardNumber: 3, name: 'Ward 3 - East Hill View', councillorName: 'Unassigned', councillorEmail: '', population: 52000, activeComplaints: 0, resolvedComplaints: 0 },
  { id: 'w_4', wardNumber: 4, name: 'Ward 4 - Green Valley South', councillorName: 'Unassigned', councillorEmail: '', population: 41000, activeComplaints: 0, resolvedComplaints: 0 },
  { id: 'w_5', wardNumber: 5, name: 'Ward 5 - Industrial Hub West', councillorName: 'Unassigned', councillorEmail: '', population: 49000, activeComplaints: 0, resolvedComplaints: 0 },
  { id: 'w_6', wardNumber: 6, name: 'Ward 6 - Tech Park Corridor', councillorName: 'Unassigned', councillorEmail: '', population: 48000, activeComplaints: 0, resolvedComplaints: 0 },
  { id: 'w_7', wardNumber: 7, name: 'Ward 7 - Metro Station Circle', councillorName: 'Unassigned', councillorEmail: '', population: 39000, activeComplaints: 0, resolvedComplaints: 0 },
  { id: 'w_8', wardNumber: 8, name: 'Ward 8 - Heritage Old City', councillorName: 'Unassigned', councillorEmail: '', population: 36000, activeComplaints: 0, resolvedComplaints: 0 },
];

const MOCK_ACTIVITY: SystemActivityLog[] = [];

const MOCK_NOTIFICATIONS: NotificationItem[] = [];

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
      activeNotices: 0,
      categoryBreakdown: [],
      monthlyTrends: [],
    };
  },

  getUsers: async (): Promise<User[]> => {
    try {
      const res = await api.get('/admin/users');
      if (res.data && Array.isArray(res.data)) {
        return res.data.map((u: User) => ({ ...u, status: u.status || 'ACTIVE' }));
      }
    } catch (err) {
      console.warn('[adminService] Backend user fetch error:', err);
    }
    return MOCK_USERS;
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
      if (err.response) {
        if (err.response.data && err.response.data.error) {
          throw new Error(err.response.data.error);
        }
        throw new Error(`Database operation failed (${err.response.status}). Could not save user to PostgreSQL.`);
      }
      throw new Error('Backend server connection failed. Could not reach PostgreSQL database.');
    }
    throw new Error('Unable to create user in database.');
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    try {
      await api.delete(`/admin/users/${userId}`);
      return true;
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        throw new Error(err.response.data.error);
      }
      throw new Error('Failed to delete user from PostgreSQL database.');
    }
  },

  updateUserStatus: async (userId: string, newStatus: 'ACTIVE' | 'INACTIVE'): Promise<boolean> => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      return true;
    } catch (err: any) {
      console.warn('[adminService] Backend status update error:', err);
    }
    const users = getLocalUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      users[idx].status = newStatus;
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    }
    return true;
  },

  getWards: async (): Promise<Ward[]> => {
    try {
      const res = await api.get('/admin/wards');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) return res.data;
    } catch (err) {
      // Fallback
    }
    return MOCK_WARDS;
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
      resolvedComplaints: 0,
    };
  },

  getActivityLogs: async (): Promise<SystemActivityLog[]> => {
    return MOCK_ACTIVITY;
  },

  getNotifications: async (): Promise<NotificationItem[]> => {
    return MOCK_NOTIFICATIONS;
  },
};

export default adminService;
