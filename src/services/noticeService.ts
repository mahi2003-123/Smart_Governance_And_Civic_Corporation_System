import api from './api';
import { WardNotice } from '../types';

export const DEFAULT_NOTICES: WardNotice[] = [
  {
    id: 'not_01',
    title: 'Scheduled Water Supply Maintenance - Ward 1',
    description: 'Pipeline repairs on Main Street scheduled for Sunday 10:00 AM to 4:00 PM.',
    category: 'WATER_SUPPLY',
    priority: 'HIGH',
    ward: 'Ward 1 - Central Town',
    authorName: 'Councillor Office',
    authorRole: 'COUNCILLOR',
    createdAt: new Date().toISOString(),
    isPublic: true,
  }
];

export const noticeService = {
  getNotices: async (ward?: string): Promise<WardNotice[]> => {
    if (typeof window !== 'undefined' && localStorage.getItem('sgcs_auth_token')?.includes('test')) {
      return DEFAULT_NOTICES;
    }
    try {
      const res = await api.get('/notices', { params: ward ? { ward } : {} });
      return Array.isArray(res.data) && res.data.length > 0 ? res.data : DEFAULT_NOTICES;
    } catch {
      return DEFAULT_NOTICES;
    }
  },

  createNotice: async (payload: Omit<WardNotice, 'id' | 'publishDate'>): Promise<WardNotice> => {
    const res = await api.post('/notices', payload);
    return res.data;
  },

  deleteNotice: async (id: string): Promise<void> => {
    await api.delete(`/notices/${id}`);
  }
};
