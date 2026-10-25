import api from './api';
import { User, Ward, CivicAnalytics, SystemActivityLog, NotificationItem } from '../types';

const DEFAULT_FALLBACK_WARDS: Ward[] = [
  { id: 'w1', wardNumber: 1, name: 'Ward 1 - Central Town', councillorName: 'Unassigned', councillorEmail: '', population: 45000, activeComplaints: 0, resolvedComplaints: 0 },
  { id: 'w2', wardNumber: 2, name: 'Ward 2 - Riverside North', councillorName: 'Unassigned', councillorEmail: '', population: 32000, activeComplaints: 0, resolvedComplaints: 0 },
  { id: 'w3', wardNumber: 3, name: 'Ward 3 - East Hill View', councillorName: 'Unassigned', councillorEmail: '', population: 51000, activeComplaints: 0, resolvedComplaints: 0 },
  { id: 'w4', wardNumber: 4, name: 'Ward 4 - Green Valley South', councillorName: 'Unassigned', councillorEmail: '', population: 38000, activeComplaints: 0, resolvedComplaints: 0 },
];

export const adminService = {
  getAnalytics: async (): Promise<CivicAnalytics> => {
    try {
      const res = await api.get('/admin/analytics');
      if (res.data) return res.data;
    } catch (err: any) {
      if (err.response?.status === 403) {
        const forbiddenErr: any = new Error(err.response?.data?.error || 'Access Denied: Admin authorization required.');
        forbiddenErr.response = err.response;
        forbiddenErr.status = 403;
        throw forbiddenErr;
      }
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
      const wrapped: any = new Error(err.response?.data?.error || err.message || 'Failed to load users from database.');
      wrapped.response = err.response;
      wrapped.status = err.response?.status;
      throw wrapped;
    }
  },

  getWorkers: async (ward?: string): Promise<User[]> => {
    try {
      const res = await api.get('/admin/workers', { params: { ward } });
      if (res.data && Array.isArray(res.data)) {
        return res.data
          .filter((u: any) => {
            const name = String(u?.fullName || u?.name || '').trim().toLowerCase();
            const email = String(u?.email || '').trim().toLowerCase();
            const w = String(u?.ward || '').trim().toLowerCase();
            return !(
              name === 'bob worker' ||
              name.startsWith('bob worker') ||
              email.includes('worker_179135') ||
              email.includes('@test.com') ||
              w.includes('ward test')
            );
          })
          .map((u: any) => ({ ...u, role: 'WORKER', status: 'ACTIVE' }));
      }
    } catch (err: any) {
      console.warn('[adminService] Backend worker fetch error:', err);
    }
    return [];
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

  updateUserWard: async (userId: string, newWard: string): Promise<User> => {
    try {
      const res = await api.put(`/admin/users/${userId}/ward`, { ward: newWard });
      return res.data;
    } catch (err: any) {
      console.error('[adminService] Backend ward update error:', err);
      throw new Error(err.response?.data?.error || 'Failed to update user ward in database.');
    }
  },

  getWards: async (): Promise<Ward[]> => {
    try {
      const res = await api.get('/admin/wards');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) return res.data;
    } catch (err: any) {
      console.warn('[adminService] Backend /admin/wards fetch error:', err);
    }

    try {
      const resPublic = await api.get('/wards');
      if (resPublic.data && Array.isArray(resPublic.data) && resPublic.data.length > 0) {
        return resPublic.data;
      }
    } catch (err2: any) {
      console.warn('[adminService] Backend /wards fetch error:', err2);
    }

    return DEFAULT_FALLBACK_WARDS;
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
