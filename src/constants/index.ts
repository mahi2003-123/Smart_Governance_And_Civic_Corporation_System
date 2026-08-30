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
  PENDING: { bg: '#E8EFE9', text: '#304B3A' },
  IN_PROGRESS: { bg: '#F3F5F2', text: '#496A57' },
  RESOLVED: { bg: '#F8F9F7', text: '#202522' },
  REJECTED: { bg: '#FDF2F2', text: '#B45D59' }
};

export const PRIORITY_COLORS: Record<ComplaintPriority, { bg: string; text: string }> = {
  LOW: { bg: '#F8F9F7', text: '#68706B' },
  MEDIUM: { bg: '#E8EFE9', text: '#304B3A' },
  HIGH: { bg: '#FBF4E8', text: '#B58A45' },
  URGENT: { bg: '#496A57', text: '#FFFFFF' }
};

export const NOTICE_PRIORITY_COLORS: Record<NoticePriority, { bg: string; text: string; border: string }> = {
  NORMAL: { bg: '#F8F9F7', text: '#202522', border: '#E5E8E4' },
  IMPORTANT: { bg: '#E8EFE9', text: '#304B3A', border: '#496A57' },
  EMERGENCY: { bg: '#496A57', text: '#FFFFFF', border: '#304B3A' }
};

export const ROLE_LABELS: Record<UserRole, string> = {
  CITIZEN: 'Citizen',
  COUNCILLOR: 'Ward Councillor',
  WORKER: 'Field Worker',
  ADMIN: 'System Admin'
};
