import api from './api';
import { WardNotice } from '../types';

export const noticeService = {
  getNotices: async (ward?: string): Promise<WardNotice[]> => {
    const res = await api.get('/notices', { params: ward ? { ward } : {} });
    return Array.isArray(res.data) ? res.data : [];
  },

  createNotice: async (payload: Omit<WardNotice, 'id' | 'publishDate'>): Promise<WardNotice> => {
    const res = await api.post('/notices', payload);
    return res.data;
  },

  deleteNotice: async (id: string): Promise<void> => {
    await api.delete(`/notices/${id}`);
  }
};
