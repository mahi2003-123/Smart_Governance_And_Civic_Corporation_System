import { ComplaintCategory, ComplaintPriority, ComplaintStatus, NoticePriority, UserRole } from '../types';

export const WARDS_LIST = [
  'Ward 1 - Central Town',
  'Ward 2 - Riverside North',
  'Ward 3 - East Hill View',
  'Ward 4 - Green Valley South',
  'Ward 5 - Industrial Hub West',
  'Ward 6 - Tech Park Corridor',
  'Ward 7 - Metro Station Circle',
  'Ward 8 - Heritage Old City'
];

export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'Roads & Potholes',
  'Street Lighting',
  'Water Supply',
  'Waste Management',
  'Sewage & Drainage',
  'Parks & Recreation',
  'Public Safety',
  'Other'
];

export const COMPLAINT_PRIORITIES: ComplaintPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const STATUS_COLORS: Record<ComplaintStatus, { bg: string; text: string }> = {
  PENDING: { bg: '#EFF6FF', text: '#2563EB' },
  IN_PROGRESS: { bg: '#DBEAFE', text: '#1E40AF' },
  RESOLVED: { bg: '#F1F5F9', text: '#334155' },
  REJECTED: { bg: '#F8FAFC', text: '#64748B' }
};

export const PRIORITY_COLORS: Record<ComplaintPriority, { bg: string; text: string }> = {
  LOW: { bg: '#F8FAFC', text: '#64748B' },
  MEDIUM: { bg: '#F1F5F9', text: '#475569' },
  HIGH: { bg: '#EFF6FF', text: '#2563EB' },
  URGENT: { bg: '#1E3A8A', text: '#FFFFFF' }
};

export const NOTICE_PRIORITY_COLORS: Record<NoticePriority, { bg: string; text: string; border: string }> = {
  NORMAL: { bg: '#F8FAFC', text: '#334155', border: '#E2E8F0' },
  IMPORTANT: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },
  EMERGENCY: { bg: '#1E3A8A', text: '#FFFFFF', border: '#1E40AF' }
};

export const ROLE_LABELS: Record<UserRole, string> = {
  CITIZEN: 'Citizen',
  COUNCILLOR: 'Ward Councillor',
  WORKER: 'Field Worker',
  ADMIN: 'System Admin'
};
