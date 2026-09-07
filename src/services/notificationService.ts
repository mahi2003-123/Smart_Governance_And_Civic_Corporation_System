import api from './api';
import { NotificationItem } from '../types';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_001',
    title: 'Complaint Status Updated',
    message: 'Your complaint SGCS-2026-8941 ("Major Pothole Cluster") is now In Progress. Field technician has been assigned.',
    type: 'COMPLAINT',
    read: false,
    createdAt: '2026-08-02T10:05:00Z',
    linkUrl: '/citizen/complaints/cmp_001',
  },
  {
    id: 'notif_002',
    title: 'New Ward Notice Issued',
    message: 'Ward Councillor published a new notice: "Scheduled Water Supply Interruption" for Ward 1 - Central Town.',
    type: 'NOTICE',
    read: false,
    createdAt: '2026-08-04T12:00:00Z',
    linkUrl: '/citizen/notices',
  },
  {
    id: 'notif_003',
    title: 'Proposal Upvoted',
    message: 'Your community proposal "Installation of Solar Streetlights" has reached 140+ community votes!',
    type: 'PROPOSAL',
    read: true,
    createdAt: '2026-08-03T16:30:00Z',
    linkUrl: '/citizen/proposals/prp_001',
  },
  {
    id: 'notif_004',
    title: 'Complaint Resolved',
    message: 'Your complaint SGCS-2026-8810 ("Low Water Pressure") has been resolved. Please rate your experience!',
    type: 'FEEDBACK',
    read: true,
    createdAt: '2026-07-20T16:05:00Z',
    linkUrl: '/citizen/complaints/cmp_004',
  },
];

let notificationsMemory = [...INITIAL_NOTIFICATIONS];

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
