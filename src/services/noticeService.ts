import api from './api';
import { WardNotice } from '../types';

export const INITIAL_NOTICES: WardNotice[] = [
  {
    id: 'ntc_001',
    title: 'Scheduled Water Supply Interruption for Pipe Replacement',
    content: 'Please note that main feeder pipeline replacement work will take place on Thursday, Aug 7th between 9:00 AM and 4:00 PM. Residents of Ward 1 & Ward 2 are advised to store sufficient water in advance.',
    ward: 'Ward 1 - Central Town',
    priority: 'EMERGENCY',
    publishedBy: 'Hon. Priya Verma (Ward Councillor)',
    publishDate: '2026-08-04T12:00:00Z',
    expiryDate: '2026-08-08T00:00:00Z',
    category: 'Water Utility Advisory'
  },
  {
    id: 'ntc_002',
    title: 'Civic Townhall Meeting: Annual Infrastructure Budget Consultation',
    content: 'All residents of Ward 1 are cordially invited to participate in the open Townhall session at Community Center Auditorium to present local priorities for the FY 2026-27 Municipal Budget allocation.',
    ward: 'Ward 1 - Central Town',
    priority: 'IMPORTANT',
    publishedBy: 'Hon. Priya Verma',
    publishDate: '2026-08-02T10:00:00Z',
    expiryDate: '2026-08-15T00:00:00Z',
    category: 'Community Townhall'
  },
  {
    id: 'ntc_003',
    title: 'Special Monsoon Sanitation & Mosquito Eradication Drive',
    content: 'Municipal health squads will conduct door-to-door anti-larval spraying starting Monday. Please ensure stagnant water containers are cleared.',
    ward: 'Ward 2 - Riverside North',
    priority: 'NORMAL',
    publishedBy: 'Municipal Health Officer',
    publishDate: '2026-07-28T09:00:00Z',
    category: 'Health & Sanitation'
  }
];

let noticesMemory = [...INITIAL_NOTICES];

export const noticeService = {
  getNotices: async (ward?: string): Promise<WardNotice[]> => {
    try {
      const res = await api.get('/notices', { params: { ward } });
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    await new Promise((res) => setTimeout(res, 200));
    if (ward && ward !== 'All Wards') {
      return noticesMemory.filter((n) => n.ward.toLowerCase().includes(ward.toLowerCase()) || n.ward === 'All Wards');
    }
    return noticesMemory;
  },

  createNotice: async (payload: Omit<WardNotice, 'id' | 'publishDate'>): Promise<WardNotice> => {
    try {
      const res = await api.post('/notices', payload);
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    await new Promise((res) => setTimeout(res, 300));
    const newNotice: WardNotice = {
      ...payload,
      id: `ntc_${Date.now()}`,
      publishDate: new Date().toISOString()
    };
    noticesMemory = [newNotice, ...noticesMemory];
    return newNotice;
  }
};
