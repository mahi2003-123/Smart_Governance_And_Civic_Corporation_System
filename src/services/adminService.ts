import api from './api';
import { User, Ward, CivicAnalytics, SystemActivityLog, NotificationItem } from '../types';

export const adminService = {
  getAnalytics: async (): Promise<CivicAnalytics> => {
    try {
      const res = await api.get('/admin/analytics');
      if (res.data) return res.data;
    } catch (err: any) {
      console.error('[adminService] Backend analytics fetch error:', err);
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
      return [];
    } catch (err: any) {
      console.error('[adminService] Backend user fetch error:', err);
      throw new Error(err.response?.data?.error || err.message || 'Failed to load users from database.');
    }
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
      console.error('[adminService] Backend status update error:', err);
      throw new Error(err.response?.data?.error || 'Failed to update user status in PostgreSQL database.');
    }
  },

  getWards: async (): Promise<Ward[]> => {
    try {
      const res = await api.get('/admin/wards');
      if (res.data && Array.isArray(res.data)) return res.data;
      return [];
    } catch (err: any) {
      console.error('[adminService] Backend wards fetch error:', err);
      throw new Error(err.response?.data?.error || err.message || 'Failed to load wards from database.');
    }
  },

  createWard: async (wardData: Omit<Ward, 'id' | 'activeComplaints' | 'resolvedComplaints'>): Promise<Ward> => {
    try {
      const res = await api.post('/admin/wards', wardData);
      if (res.data) return res.data;
      throw new Error('Failed to create ward in database.');
    } catch (err: any) {
      console.error('[adminService] Create ward error:', err);
      throw new Error(err.response?.data?.error || err.message || 'Failed to create ward in PostgreSQL database.');
    }
  },

  getActivityLogs: async (): Promise<SystemActivityLog[]> => {
    try {
      const res = await api.get('/admin/audit-logs');
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      try {
        const res2 = await api.get('/admin/activities');
        if (res2.data && Array.isArray(res2.data)) {
          return res2.data;
        }
      } catch (err2) {
        console.error('[adminService] Backend activity logs fetch error:', err2);
      }
    }
    return [];
  },

  getNotifications: async (): Promise<NotificationItem[]> => {
    try {
      const res = await api.get('/notifications');
      if (res.data && Array.isArray(res.data)) return res.data;
    } catch (err) {
      console.error('[adminService] Backend notifications fetch error:', err);
    }
    return [];
  },
};

export default adminService;
