import api from './api';
import { Complaint, ComplaintStatus, ComplaintPriority, ComplaintCategory } from '../types';

export const INITIAL_COMPLAINTS: Complaint[] = [];

const getSavedComplaints = (): Complaint[] => {
  try {
    const stored = localStorage.getItem('sgcs_complaints');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse saved complaints:', e);
  }
  return INITIAL_COMPLAINTS;
};

const saveComplaints = (list: Complaint[]) => {
  try {
    localStorage.setItem('sgcs_complaints', JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save complaints to localStorage:', e);
  }
};

let complaintsMemory = getSavedComplaints();

export const complaintService = {
  getComplaints: async (filters?: {
    status?: ComplaintStatus;
    category?: ComplaintCategory;
    ward?: string;
    search?: string;
    citizenId?: string;
    assignedWorkerId?: string;
  }): Promise<Complaint[]> => {
    let resultList: Complaint[] = [];

    try {
      const res = await api.get('/complaints', { params: filters });
      if (res.data && Array.isArray(res.data)) {
        // Parse images if backend sends string
        resultList = res.data.map((item: any) => ({
          ...item,
          images: Array.isArray(item.images)
            ? item.images
            : (item.images ? item.images.split(',') : [])
        }));
      }
    } catch (err) {
      console.warn('[SGCS Frontend] PostgreSQL server unreachable, using local memory store.');
    }

    if (resultList.length === 0) {
      resultList = [...complaintsMemory];
    } else {
      // Merge memory complaints that might not be in API response yet
      const apiIds = new Set(resultList.map((c) => c.id));
      const missingFromApi = complaintsMemory.filter((c) => !apiIds.has(c.id));
      resultList = [...missingFromApi, ...resultList];
    }

    if (filters) {
      if (filters.status) {
        resultList = resultList.filter((c) => c.status === filters.status);
      }
      if (filters.category) {
        resultList = resultList.filter((c) => c.category === filters.category);
      }
      if (filters.ward) {
        resultList = resultList.filter((c) => c.ward.toLowerCase().includes(filters.ward!.toLowerCase()));
      }
      if (filters.citizenId) {
        resultList = resultList.filter((c) => c.citizenId === filters.citizenId);
      }
      if (filters.assignedWorkerId) {
        resultList = resultList.filter((c) => c.assignedWorkerId === filters.assignedWorkerId);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        resultList = resultList.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.trackingNumber.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.locationAddress.toLowerCase().includes(q)
        );
      }
    }

    return resultList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getComplaintById: async (id: string): Promise<Complaint | null> => {
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.data) {
        return {
          ...res.data,
          images: Array.isArray(res.data.images)
            ? res.data.images
            : (res.data.images ? res.data.images.split(',') : [])
        };
      }
    } catch (err) {
      // Fallback to local memory
    }

    return complaintsMemory.find((c) => c.id === id || c.trackingNumber === id) || null;
  },

  createComplaint: async (payload: {
    title: string;
    category: ComplaintCategory;
    priority: ComplaintPriority;
    description: string;
    ward: string;
    locationAddress: string;
    citizenId: string;
    citizenName: string;
    citizenPhone: string;
    images?: string[];
  }): Promise<Complaint> => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);

    const newComplaint: Complaint = {
      id: `cmp_${Date.now()}`,
      trackingNumber: `TRK-${randomSuffix}`,
      title: payload.title,
      category: payload.category,
      priority: payload.priority || 'MEDIUM',
      description: payload.description,
      ward: payload.ward,
      locationAddress: payload.locationAddress,
      status: 'PENDING',
      citizenId: payload.citizenId,
      citizenName: payload.citizenName,
      citizenPhone: payload.citizenPhone,
      assignedWorkerId: undefined,
      assignedWorkerName: undefined,
      images: payload.images || [
        'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=600'
      ],
      timeline: [
        {
          id: `tl_${Date.now()}`,
          title: 'Complaint Registered',
          description: 'Filed through Citizen Portal. Awaiting Councillor triage & technician assignment.',
          timestamp: new Date().toISOString(),
          actorName: payload.citizenName,
          actorRole: 'CITIZEN',
          status: 'PENDING'
        }
      ],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save locally first so it is never lost
    complaintsMemory = [newComplaint, ...complaintsMemory];
    saveComplaints(complaintsMemory);

    // Try posting to Spring Boot backend
    try {
      const apiPayload = {
        ...payload,
        priority: payload.priority || 'MEDIUM',
        status: 'PENDING',
        images: Array.isArray(payload.images) ? payload.images.join(',') : (payload.images || '')
      };
      const res = await api.post('/complaints', apiPayload);
      if (res.data) {
        const savedFromBackend: Complaint = {
          ...res.data,
          images: Array.isArray(res.data.images)
            ? res.data.images
            : (res.data.images ? res.data.images.split(',') : [])
        };
        // Replace temporary local complaint with backend response
        const idx = complaintsMemory.findIndex(c => c.id === newComplaint.id);
        if (idx !== -1) {
          complaintsMemory[idx] = savedFromBackend;
        } else {
          complaintsMemory = [savedFromBackend, ...complaintsMemory];
        }
        saveComplaints(complaintsMemory);
        return savedFromBackend;
      }
    } catch (err) {
      console.warn('[SGCS Frontend] Backend save failed, kept local complaint copy.');
    }

    return newComplaint;
  },

  updateComplaintStatus: async (
    id: string,
    status: ComplaintStatus,
    actorName: string,
    actorRole: 'CITIZEN' | 'COUNCILLOR' | 'WORKER' | 'ADMIN',
    note?: string,
    completionImage?: string
  ): Promise<Complaint> => {
    try {
      const res = await api.patch(`/complaints/${id}/status`, {
        status,
        actorName,
        actorRole,
        note,
        completionImage
      });
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    await new Promise((res) => setTimeout(res, 200));
    const index = complaintsMemory.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Complaint not found');

    const existing = complaintsMemory[index];
    const newTimelineItem = {
      id: `tl_${Date.now()}`,
      title: `Status updated to ${status.replace('_', ' ')}`,
      description: note || `Status changed by ${actorName}`,
      timestamp: new Date().toISOString(),
      actorName,
      actorRole,
      status
    };

    const updated: Complaint = {
      ...existing,
      status,
      updatedAt: new Date().toISOString(),
      timeline: [newTimelineItem, ...existing.timeline],
      completionImage: completionImage || existing.completionImage
    };

    complaintsMemory[index] = updated;
    saveComplaints(complaintsMemory);
    return updated;
  },

  assignWorker: async (id: string, workerId: string, workerName: string, assignerName: string, priority?: ComplaintPriority): Promise<Complaint> => {
    try {
      const res = await api.post(`/complaints/${id}/assign`, {
        workerId,
        workerName,
        assignerName,
        priority
      });
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    await new Promise((res) => setTimeout(res, 200));
    const index = complaintsMemory.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Complaint not found');

    const existing = complaintsMemory[index];
    const newTimelineItem = {
      id: `tl_${Date.now()}`,
      title: `Assigned to ${workerName}`,
      description: `Assigned for field action by Councillor ${assignerName}${priority ? ` with priority ${priority}` : ''}`,
      timestamp: new Date().toISOString(),
      actorName: assignerName,
      actorRole: 'COUNCILLOR' as const,
      status: 'IN_PROGRESS' as const
    };

    const updated: Complaint = {
      ...existing,
      assignedWorkerId: workerId,
      assignedWorkerName: workerName,
      priority: priority || existing.priority,
      status: 'IN_PROGRESS',
      updatedAt: new Date().toISOString(),
      timeline: [newTimelineItem, ...existing.timeline]
    };

    complaintsMemory[index] = updated;
    saveComplaints(complaintsMemory);
    return updated;
  },

  addComment: async (id: string, authorName: string, authorRole: 'CITIZEN' | 'COUNCILLOR' | 'WORKER' | 'ADMIN', content: string): Promise<Complaint> => {
    try {
      const res = await api.post(`/complaints/${id}/comments`, {
        authorName,
        authorRole,
        content
      });
      if (res.data) return res.data;
    } catch (err) {
      // Fallback
    }

    await new Promise((res) => setTimeout(res, 200));
    const index = complaintsMemory.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Complaint not found');

    const existing = complaintsMemory[index];
    const newComment = {
      id: `cmt_${Date.now()}`,
      authorName,
      authorRole,
      content,
      createdAt: new Date().toISOString()
    };

    const updated: Complaint = {
      ...existing,
      comments: [...existing.comments, newComment],
      updatedAt: new Date().toISOString()
    };

    complaintsMemory[index] = updated;
    saveComplaints(complaintsMemory);
    return updated;
  }
};
