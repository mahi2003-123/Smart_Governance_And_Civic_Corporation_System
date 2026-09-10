import api from './api';
import { NotificationItem } from '../types';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

let notificationsMemory: NotificationItem[] = [];

export const notificationService = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    try {
      const res = await api.get('/notifications');
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    await new Promise((res) => setTimeout(res, 200));
    return [...notificationsMemory];
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
