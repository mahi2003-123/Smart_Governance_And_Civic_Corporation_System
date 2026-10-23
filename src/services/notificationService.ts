import api from './api';
import { NotificationItem } from '../types';

export const notificationService = {
  getNotifications: async (_userWard?: string, _userId?: string, _userRole?: string): Promise<NotificationItem[]> => {
    const res = await api.get('/notifications');
    return Array.isArray(res.data) ? res.data : [];
  },

  markAsRead: async (id: string): Promise<NotificationItem> => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  registerDeviceToken: async (fcmToken: string, deviceType?: string, deviceName?: string): Promise<void> => {
    await api.post('/notifications/device-token', { fcmToken, deviceType, deviceName });
  }
};
