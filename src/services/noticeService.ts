import api from './api';
import { WardNotice } from '../types';
import { notificationService } from './notificationService';

export const INITIAL_NOTICES: WardNotice[] = [];

let noticesMemory: WardNotice[] = [];

export const noticeService = {
  getNotices: async (ward?: string): Promise<WardNotice[]> => {
    try {
      const res = await api.get('/notices', { params: { ward } });
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    if (ward && ward !== 'All Wards' && ward !== 'ALL') {
      return noticesMemory.filter((n) => n.ward.toLowerCase().includes(ward.toLowerCase()) || n.ward.includes('All Wards') || n.ward.includes('System Wide'));
    }
    return noticesMemory;
  },

  createNotice: async (payload: Omit<WardNotice, 'id' | 'publishDate'>): Promise<WardNotice> => {
    let created: WardNotice | null = null;
    try {
      const res = await api.post('/notices', payload);
      if (res.data) created = res.data;
    } catch (err) {
      // Fallback
    }

    if (!created) {
      created = {
        ...payload,
        id: `ntc_${Date.now()}`,
        publishDate: new Date().toISOString()
      };
      noticesMemory = [created, ...noticesMemory];
    }

    // Broadcast system notification to all users so everyone gets an alert
    try {
      await notificationService.addNotification({
        title: `📢 ${created.priority === 'EMERGENCY' ? 'EMERGENCY ALERT' : 'Official Ward Notice'}: ${created.title}`,
        message: `Published by ${created.publishedBy} (${created.ward}): ${created.content.substring(0, 100)}...`,
        type: 'NOTICE',
        linkUrl: '/citizen/notices'
      });
    } catch (e) {
      console.error('Notification broadcast error:', e);
    }

    return created;
  }
};
