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
  PENDING: { bg: '#FFF8E1', text: '#D97706' },
  IN_PROGRESS: { bg: '#E0F2F1', text: '#0F4C5C' },
  RESOLVED: { bg: '#E8F5E9', text: '#2D6A4F' },
  REJECTED: { bg: '#FFEBEE', text: '#C0392B' }
};

export const PRIORITY_COLORS: Record<ComplaintPriority, { bg: string; text: string }> = {
  LOW: { bg: '#F4F1EA', text: '#5A6672' },
  MEDIUM: { bg: '#E0F2F1', text: '#0F4C5C' },
  HIGH: { bg: '#FFF8E1', text: '#D97706' },
  URGENT: { bg: '#C85A32', text: '#FFFFFF' }
};

export const NOTICE_PRIORITY_COLORS: Record<NoticePriority, { bg: string; text: string; border: string }> = {
  NORMAL: { bg: '#F4F1EA', text: '#1A232A', border: '#E2E6EA' },
  IMPORTANT: { bg: '#E0F2F1', text: '#0F4C5C', border: '#0F4C5C' },
  EMERGENCY: { bg: '#C85A32', text: '#FFFFFF', border: '#A03F1B' }
};

export const ROLE_LABELS: Record<UserRole, string> = {
  CITIZEN: 'Citizen',
  COUNCILLOR: 'Ward Councillor',
  WORKER: 'Field Worker',
  ADMIN: 'System Admin'
};
