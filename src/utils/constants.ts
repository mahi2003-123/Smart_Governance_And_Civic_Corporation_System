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

export const STATUS_COLORS: Record<ComplaintStatus, { bg: string; text: string; muiColor: 'default' | 'warning' | 'info' | 'success' | 'error' }> = {
  PENDING: { bg: '#FFF4E5', text: '#B76E00', muiColor: 'warning' },
  IN_PROGRESS: { bg: '#E8F4FD', text: '#1D6FBA', muiColor: 'info' },
  RESOLVED: { bg: '#EDF7ED', text: '#1E4620', muiColor: 'success' },
  REJECTED: { bg: '#FDEEDC', text: '#A71D2A', muiColor: 'error' }
};

export const PRIORITY_COLORS: Record<ComplaintPriority, { bg: string; text: string }> = {
  LOW: { bg: '#F0F4F8', text: '#475569' },
  MEDIUM: { bg: '#E2E8F0', text: '#334155' },
  HIGH: { bg: '#FEF3C7', text: '#92400E' },
  URGENT: { bg: '#FEE2E2', text: '#991B1B' }
};

export const NOTICE_PRIORITY_COLORS: Record<NoticePriority, { bg: string; text: string; border: string }> = {
  NORMAL: { bg: '#F8FAFC', text: '#334155', border: '#CBD5E1' },
  IMPORTANT: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  EMERGENCY: { bg: '#FEF2F2', text: '#B91C1C', border: '#FCA5A5' }
};

export const ROLE_LABELS: Record<UserRole, string> = {
  CITIZEN: 'Citizen',
  COUNCILLOR: 'Ward Councillor',
  WORKER: 'Field Worker',
  ADMIN: 'System Admin'
};
