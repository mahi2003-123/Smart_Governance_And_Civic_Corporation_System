import api from './api';
import { NotificationItem } from '../types';
import { matchesWard } from '../utils/wardUtils';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

let notificationsMemory: NotificationItem[] = [];

export const notificationService = {
  getNotifications: async (userWard?: string, userId?: string, userRole?: string): Promise<NotificationItem[]> => {
    try {
      const res = await api.get('/notifications');
      if (res.data && Array.isArray(res.data)) {
        // Client-side filtering ensures ward-specific isolation
        return res.data.filter((n: NotificationItem) => {
          const r = n.recipientId;
          if (!r || r === 'ALL') return true;
          if (userId && r === userId) return true;
          if (userRole && r.toUpperCase() === userRole.toUpperCase()) return true;
          if (userWard && r.toLowerCase().startsWith('ward_')) {
            const notifWard = r.substring(5).trim();
            return matchesWard(notifWard, userWard);
          }
          return !r.toLowerCase().startsWith('ward_');
        });
      }
    } catch (err) {
      // Fallback
    }

    await new Promise((res) => setTimeout(res, 200));
    return notificationsMemory.filter((n) => {
      const r = n.recipientId;
      if (!r || r === 'ALL') return true;
      if (userId && r === userId) return true;
      if (userRole && r.toUpperCase() === userRole.toUpperCase()) return true;
      if (userWard && r.toLowerCase().startsWith('ward_')) {
        const notifWard = r.substring(5).trim();
        return matchesWard(notifWard, userWard);
      }
      return !r.toLowerCase().startsWith('ward_');
    });
  },

  markAsRead: async (id: string): Promise<NotificationItem[]> => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    await new Promise((res) => setTimeout(res, 150));
    notificationsMemory = notificationsMemory.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    return [...notificationsMemory];
  },

  markAllAsRead: async (): Promise<NotificationItem[]> => {
    try {
      const res = await api.patch('/notifications/read-all');
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    await new Promise((res) => setTimeout(res, 150));
    notificationsMemory = notificationsMemory.map((n) => ({ ...n, read: true }));
    return [...notificationsMemory];
  },

  addNotification: async (item: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>): Promise<NotificationItem> => {
    try {
      const res = await api.post('/notifications', item);
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    const newNotif: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    notificationsMemory = [newNotif, ...notificationsMemory];
    return newNotif;
  },
};
