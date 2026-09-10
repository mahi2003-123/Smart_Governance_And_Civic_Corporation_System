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
  PENDING: { bg: '#FDF2E9', text: '#E67E22' },
  ASSIGNED: { bg: '#EBF5FF', text: '#1E40AF' },
  IN_PROGRESS: { bg: '#E8F3EE', text: '#1F4D3A' },
  PENDING_APPROVAL: { bg: '#FEF3C7', text: '#92400E' },
  RESOLVED: { bg: '#E8F3EE', text: '#1F4D3A' },
  REJECTED: { bg: '#FDEDEC', text: '#E74C3C' }
};

export const PRIORITY_COLORS: Record<ComplaintPriority, { bg: string; text: string }> = {
  LOW: { bg: '#F2F7F4', text: '#5F7367' },
  MEDIUM: { bg: '#E8F3EE', text: '#1F4D3A' },
  HIGH: { bg: '#FDF2E9', text: '#E67E22' },
  URGENT: { bg: '#E74C3C', text: '#FFFFFF' }
};

export const NOTICE_PRIORITY_COLORS: Record<NoticePriority, { bg: string; text: string; border: string }> = {
  NORMAL: { bg: '#F2F7F4', text: '#1C2A24', border: '#E2EAF0' },
  IMPORTANT: { bg: '#E8F3EE', text: '#1F4D3A', border: '#C3E0D2' },
  EMERGENCY: { bg: '#E74C3C', text: '#FFFFFF', border: '#C0392B' }
};

export const ROLE_LABELS: Record<UserRole, string> = {
  CITIZEN: 'Citizen',
  COUNCILLOR: 'Ward Councillor',
  WORKER: 'Field Worker',
  ADMIN: 'System Admin'
};
