import api from './api';
import { WardNotice } from '../types';
import { notificationService } from './notificationService';

export const INITIAL_NOTICES: WardNotice[] = [
  {
    id: 'ntc_001',
    title: 'Scheduled Water Supply Interruption for Pipe Replacement',
    content: 'Please note that main feeder pipeline replacement work will take place on Thursday, Aug 7th between 9:00 AM and 4:00 PM. Residents of Ward 1 & Ward 2 are advised to store sufficient water in advance.',
    ward: 'Ward 1 - Central Town',
    priority: 'EMERGENCY',
    publishedBy: 'Councillor Rajesh Kumar',
    publishedByRole: 'Ward Councillor',
    publishDate: '2026-08-04T12:00:00Z',
    expiryDate: '2026-08-08T00:00:00Z',
    category: 'Water Utility Advisory',
    attachmentName: 'Water_Pipe_Maintenance_Schedule.pdf',
    attachmentType: 'pdf'
  },
  {
    id: 'ntc_002',
    title: 'Civic Townhall Meeting: Annual Infrastructure Budget Consultation',
    content: 'All residents of Ward 1 are cordially invited to participate in the open Townhall session at Community Center Auditorium to present local priorities for the FY 2026-27 Municipal Budget allocation.',
    ward: 'Ward 1 - Central Town',
    priority: 'IMPORTANT',
    publishedBy: 'Councillor Rajesh Kumar',
    publishedByRole: 'Ward Councillor',
    publishDate: '2026-08-02T10:00:00Z',
    expiryDate: '2026-08-15T00:00:00Z',
    category: 'Community Townhall',
    attachmentName: 'Budget_Consultation_Poster.png',
    attachmentType: 'image'
  },
  {
    id: 'ntc_003',
    title: 'Special Monsoon Sanitation & Mosquito Eradication Drive',
    content: 'Municipal health squads will conduct door-to-door anti-larval spraying starting Monday. Please ensure stagnant water containers are cleared.',
    ward: 'Ward 2 - Riverside North',
    priority: 'NORMAL',
    publishedBy: 'Municipal Health Officer',
    publishedByRole: 'Municipal Official',
    publishDate: '2026-07-28T09:00:00Z',
    category: 'Health & Sanitation'
  }
];

let noticesMemory = [...INITIAL_NOTICES];

export const noticeService = {
  getNotices: async (ward?: string): Promise<WardNotice[]> => {
    try {
      const res = await api.get('/notices', { params: { ward } });
      if (res.data && res.data.length > 0) return res.data;
    } catch (err) {
      // Fallback
    }

    await new Promise((res) => setTimeout(res, 200));
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
      await new Promise((res) => setTimeout(res, 300));
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
