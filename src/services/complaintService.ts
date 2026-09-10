import api from './api';
import { Complaint, ComplaintStatus, ComplaintPriority, ComplaintCategory } from '../types';

export const complaintService = {
  getComplaints: async (filters?: {
    status?: ComplaintStatus;
    category?: ComplaintCategory;
    ward?: string;
    search?: string;
    citizenId?: string;
    assignedWorkerId?: string;
  }): Promise<Complaint[]> => {
    try {
      const res = await api.get('/complaints', { params: filters });
      if (res.data && Array.isArray(res.data)) {
        let resultList: Complaint[] = res.data.map((item: any) => ({
          ...item,
          images: Array.isArray(item.images)
            ? item.images
            : (item.images ? item.images.split(',') : []),
          comments: Array.isArray(item.comments) ? item.comments : [],
          timeline: Array.isArray(item.timeline) ? item.timeline : [],
        }));

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
            resultList = resultList.filter(
              (c) =>
                c.citizenId === filters.citizenId ||
                c.citizenName === filters.citizenId ||
                c.citizenPhone === filters.citizenId
            );
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
      }
      return [];
    } catch (err: any) {
      console.error('[SGCS Frontend] Failed to fetch complaints from backend:', err);
      throw new Error(err.response?.data?.error || err.message || 'Failed to load complaints from database.');
    }
  },

  getComplaintById: async (id: string): Promise<Complaint | null> => {
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.data) {
        return {
          ...res.data,
          images: Array.isArray(res.data.images)
            ? res.data.images
            : (res.data.images ? res.data.images.split(',') : []),
          comments: Array.isArray(res.data.comments) ? res.data.comments : [],
          timeline: Array.isArray(res.data.timeline) ? res.data.timeline : [],
        };
      }
      return null;
    } catch (err: any) {
      console.error('[SGCS Frontend] Failed to fetch complaint details:', err);
      throw new Error(err.response?.data?.error || err.message || 'Failed to load complaint details.');
    }
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
    try {
      const apiPayload = {
        ...payload,
        priority: payload.priority || 'MEDIUM',
        status: 'PENDING',
        images: Array.isArray(payload.images) ? payload.images.join(',') : (payload.images || '')
      };
      const res = await api.post('/complaints', apiPayload);
      if (res.data) {
        return {
          ...res.data,
          images: Array.isArray(res.data.images)
            ? res.data.images
            : (res.data.images ? res.data.images.split(',') : []),
          comments: Array.isArray(res.data.comments) ? res.data.comments : [],
          timeline: Array.isArray(res.data.timeline) ? res.data.timeline : [],
        };
      }
      throw new Error('Failed to save complaint in PostgreSQL database.');
    } catch (err: any) {
      console.error('[SGCS Frontend] Complaint creation error:', err);
      throw new Error(err.response?.data?.error || err.message || 'Error submitting complaint to database.');
    }
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
      if (res.data) {
        return {
          ...res.data,
          images: Array.isArray(res.data.images)
            ? res.data.images
            : (res.data.images ? res.data.images.split(',') : []),
          comments: Array.isArray(res.data.comments) ? res.data.comments : [],
          timeline: Array.isArray(res.data.timeline) ? res.data.timeline : [],
        };
      }
      throw new Error('Failed to update complaint status in database.');
    } catch (err: any) {
      console.error('[SGCS Frontend] Status update error:', err);
      throw new Error(err.response?.data?.error || err.message || 'Failed to update complaint status.');
    }
  },

  assignWorker: async (id: string, workerId: string, workerName: string, assignerName: string, priority?: ComplaintPriority, dueDate?: string): Promise<Complaint> => {
    try {
      const res = await api.post(`/complaints/${id}/assign`, {
        workerId,
        workerName,
        assignerName,
        priority,
        dueDate
      });
      if (res.data) {
        return {
          ...res.data,
          images: Array.isArray(res.data.images)
            ? res.data.images
            : (res.data.images ? res.data.images.split(',') : []),
          comments: Array.isArray(res.data.comments) ? res.data.comments : [],
          timeline: Array.isArray(res.data.timeline) ? res.data.timeline : [],
        };
      }
      throw new Error('Worker assignment failed in database.');
    } catch (err: any) {
      console.error('[SGCS Frontend] Worker assignment error:', err);
      throw new Error(err.response?.data?.error || err.message || 'Failed to assign worker in database.');
    }
  },

  startTask: async (id: string): Promise<Complaint> => {
    try {
      const res = await api.post(`/complaints/${id}/start`);
      if (res.data) {
        return {
          ...res.data,
          images: Array.isArray(res.data.images)
            ? res.data.images
            : (res.data.images ? res.data.images.split(',') : []),
          comments: Array.isArray(res.data.comments) ? res.data.comments : [],
          timeline: Array.isArray(res.data.timeline) ? res.data.timeline : [],
        };
      }
      throw new Error('Failed to start task in database.');
    } catch (err: any) {
      console.error('[SGCS Frontend] Start task error:', err);
      throw new Error(err.response?.data?.error || err.message || 'Failed to start task.');
    }
  },

  completeTask: async (id: string, notes?: string, afterImage?: string, beforeImage?: string): Promise<Complaint> => {
    try {
      const res = await api.post(`/complaints/${id}/complete`, {
        notes,
        afterImage,
        beforeImage
      });
      if (res.data) {
        return {
          ...res.data,
          images: Array.isArray(res.data.images)
            ? res.data.images
            : (res.data.images ? res.data.images.split(',') : []),
          comments: Array.isArray(res.data.comments) ? res.data.comments : [],
          timeline: Array.isArray(res.data.timeline) ? res.data.timeline : [],
        };
      }
      throw new Error('Failed to complete task in database.');
    } catch (err: any) {
      console.error('[SGCS Frontend] Complete task error:', err);
      throw new Error(err.response?.data?.error || err.message || 'Failed to complete task.');
    }
  },

  approveTask: async (id: string, councillorName?: string): Promise<Complaint> => {
    try {
      const res = await api.post(`/complaints/${id}/approve`);
      if (res.data) {
        return {
          ...res.data,
          images: Array.isArray(res.data.images)
            ? res.data.images
            : (res.data.images ? res.data.images.split(',') : []),
          comments: Array.isArray(res.data.comments) ? res.data.comments : [],
          timeline: Array.isArray(res.data.timeline) ? res.data.timeline : [],
        };
      }
      throw new Error('Failed to approve task in database.');
    } catch (err: any) {
      console.error('[SGCS Frontend] Approve task error:', err);
      throw new Error(err.response?.data?.error || err.message || 'Failed to approve task.');
    }
  },

  rejectTaskProof: async (id: string, councillorName?: string, feedback?: string): Promise<Complaint> => {
    try {
      const res = await api.post(`/complaints/${id}/reject-proof`, { feedback });
      if (res.data) {
        return {
          ...res.data,
          images: Array.isArray(res.data.images)
            ? res.data.images
            : (res.data.images ? res.data.images.split(',') : []),
          comments: Array.isArray(res.data.comments) ? res.data.comments : [],
          timeline: Array.isArray(res.data.timeline) ? res.data.timeline : [],
        };
      }
      throw new Error('Failed to reject task proof in database.');
    } catch (err: any) {
      console.error('[SGCS Frontend] Reject task proof error:', err);
      throw new Error(err.response?.data?.error || err.message || 'Failed to request rework.');
    }
  },

  reportDelay: async (id: string, reason: string, notes?: string, delayImage?: string): Promise<Complaint> => {
    try {
      const res = await api.post(`/complaints/${id}/delay`, {
        reason,
        notes,
        delayImage
      });
      if (res.data) {
        return {
          ...res.data,
          images: Array.isArray(res.data.images)
            ? res.data.images
            : (res.data.images ? res.data.images.split(',') : []),
          comments: Array.isArray(res.data.comments) ? res.data.comments : [],
          timeline: Array.isArray(res.data.timeline) ? res.data.timeline : [],
        };
      }
      throw new Error('Failed to report delay in database.');
    } catch (err: any) {
      console.error('[SGCS Frontend] Report delay error:', err);
      throw new Error(err.response?.data?.error || err.message || 'Failed to log delay.');
    }
  },

  addComment: async (id: string, authorName: string, authorRole: 'CITIZEN' | 'COUNCILLOR' | 'WORKER' | 'ADMIN', content: string): Promise<Complaint> => {
    try {
      const res = await api.post(`/complaints/${id}/comments`, {
        authorName,
        authorRole,
        content
      });
      if (res.data) {
        return {
          ...res.data,
          images: Array.isArray(res.data.images)
            ? res.data.images
            : (res.data.images ? res.data.images.split(',') : []),
          comments: Array.isArray(res.data.comments) ? res.data.comments : [],
          timeline: Array.isArray(res.data.timeline) ? res.data.timeline : [],
        };
      }
      throw new Error('Failed to post comment in database.');
    } catch (err: any) {
      console.error('[SGCS Frontend] Add comment error:', err);
      throw new Error(err.response?.data?.error || err.message || 'Failed to post comment.');
    }
  }
};
